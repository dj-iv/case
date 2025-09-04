#!/usr/bin/env python3
"""
Case Study Generator Web Interface

A Flask web application for generating case studies with AI assistance.
"""

import os
import secrets
import json
import tempfile
from flask import Flask, render_template, request, flash, redirect, url_for, jsonify, session
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length
from datetime import datetime

# Load environment variables (only if dotenv is available and .env file exists)
try:
    from dotenv import load_dotenv
    if os.path.exists('.env'):
        load_dotenv()
except ImportError:
    # dotenv not available, which is fine for production
    pass

from models import CaseStudyInput, CaseStudy, CaseStudySection
from ai import AIContentGenerator
from templates import WordPressFormatter

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))

class CaseStudyForm(FlaskForm):
    """Form for case study input."""
    client_name = StringField('Client/Company Name', 
                             validators=[DataRequired(), Length(min=2, max=100)],
                             render_kw={"placeholder": "e.g., Northeastern University London"})
    
    industry = StringField('Industry/Sector', 
                          validators=[DataRequired(), Length(min=2, max=50)],
                          render_kw={"placeholder": "e.g., Higher Education"})
    
    main_challenge = TextAreaField('Main Challenge', 
                                  validators=[DataRequired(), Length(min=10, max=500)],
                                  render_kw={"placeholder": "Describe the primary challenge faced by the client...", "rows": 3})
    
    solution_provided = TextAreaField('Solution Provided', 
                                     validators=[DataRequired(), Length(min=10, max=500)],
                                     render_kw={"placeholder": "Describe the solution that was implemented...", "rows": 3})
    
    location = StringField('Location (Optional)', 
                          render_kw={"placeholder": "e.g., London, UK"})
    
    project_scale = StringField('Project Scale/Size (Optional)', 
                               render_kw={"placeholder": "e.g., 2.5 floors, 1300 students"})
    
    technologies_used = StringField('Technologies Used (Optional)', 
                                   render_kw={"placeholder": "e.g., CEL-FI QUATRA 1000, CAT-6 cabling (comma-separated)"})
    
    additional_context = TextAreaField('Additional Context (Optional)', 
                                      render_kw={"placeholder": "Any additional details or context...", "rows": 2})
    
    submit = SubmitField('Generate Case Study', render_kw={"class": "btn btn-primary btn-lg"})


@app.route('/', methods=['GET', 'POST'])
def index():
    """Main page with the case study form."""
    form = CaseStudyForm()
    
    if form.validate_on_submit():
        try:
            # Check for API key
            if not os.getenv('OPENAI_API_KEY') or os.getenv('OPENAI_API_KEY') == 'your_openai_api_key_here':
                flash('Please configure your OpenAI API key in the .env file', 'error')
                return render_template('index.html', form=form)
            
            # Parse technologies
            tech_list = None
            if form.technologies_used.data:
                tech_list = [tech.strip() for tech in form.technologies_used.data.split(',') if tech.strip()]
            
            # Create input model
            case_input = CaseStudyInput(
                client_name=form.client_name.data,
                industry=form.industry.data,
                main_challenge=form.main_challenge.data,
                solution_provided=form.solution_provided.data,
                location=form.location.data if form.location.data else None,
                project_scale=form.project_scale.data if form.project_scale.data else None,
                technologies_used=tech_list,
                additional_context=form.additional_context.data if form.additional_context.data else None
            )
            
            # Generate case study
            generator = AIContentGenerator()
            case_study = generate_case_study(generator, case_input)
            
            # Store case study data in a temporary file for preview
            case_study_data = {
                'title': case_study.title,
                'sections': [
                    {
                        'title': section.title,
                        'content': section.content,
                        'section_type': section.section_type
                    }
                    for section in case_study.sections
                ],
                'wordpress_content': case_study.wordpress_content,
                'client_name': case_input.client_name
            }
            
            # Create a unique filename for this case study
            case_study_id = secrets.token_hex(8)
            temp_file = os.path.join(tempfile.gettempdir(), f'case_study_{case_study_id}.json')
            
            with open(temp_file, 'w', encoding='utf-8') as f:
                json.dump(case_study_data, f, ensure_ascii=False, indent=2)
            
            # Store only the ID in session
            session['current_case_study_id'] = case_study_id
            
            return render_template('result.html', 
                                 case_study=case_study, 
                                 client_name=case_input.client_name,
                                 case_study_id=case_study_id)
            
        except Exception as e:
            flash(f'Error generating case study: {str(e)}', 'error')
            return render_template('index.html', form=form)
    
    return render_template('index.html', form=form)


@app.route('/api/generate', methods=['POST'])
def api_generate():
    """API endpoint for generating case studies."""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['client_name', 'industry', 'main_challenge', 'solution_provided']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse technologies
        tech_list = None
        if data.get('technologies_used'):
            if isinstance(data['technologies_used'], str):
                tech_list = [tech.strip() for tech in data['technologies_used'].split(',') if tech.strip()]
            else:
                tech_list = data['technologies_used']
        
        # Create input model
        case_input = CaseStudyInput(
            client_name=data['client_name'],
            industry=data['industry'],
            main_challenge=data['main_challenge'],
            solution_provided=data['solution_provided'],
            location=data.get('location'),
            project_scale=data.get('project_scale'),
            technologies_used=tech_list,
            additional_context=data.get('additional_context')
        )
        
        # Generate case study
        generator = AIContentGenerator()
        case_study = generate_case_study(generator, case_input)
        
        return jsonify({
            'title': case_study.title,
            'wordpress_content': case_study.wordpress_content,
            'sections': [
                {
                    'title': section.title,
                    'content': section.content,
                    'section_type': section.section_type
                }
                for section in case_study.sections
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_case_study(generator: AIContentGenerator, case_input: CaseStudyInput) -> CaseStudy:
    """Generate a complete case study."""
    
    # Generate content for each section
    summary_content = generator.generate_summary(case_input)
    client_content = generator.generate_client_section(case_input)
    challenges_content = generator.generate_challenges_section(case_input)
    solution_content = generator.generate_solution_section(case_input)
    results_content = generator.generate_results_section(case_input)
    
    # Create sections
    sections = [
        CaseStudySection(title="Summary", content=summary_content, section_type="summary"),
        CaseStudySection(title="The Client", content=client_content, section_type="client"),
        CaseStudySection(title="The Challenges", content=challenges_content, section_type="challenges"),
        CaseStudySection(title="The Solution", content=solution_content, section_type="solution"),
        CaseStudySection(title="The Results", content=results_content, section_type="results")
    ]
    
    # Format for WordPress
    formatter = WordPressFormatter()
    wordpress_content = format_wordpress_content(formatter, sections)
    
    # Generate title
    title = f"Case Study: {case_input.client_name} - {case_input.main_challenge}"
    
    return CaseStudy(
        title=title,
        sections=sections,
        wordpress_content=wordpress_content
    )


def format_wordpress_content(formatter: WordPressFormatter, sections) -> str:
    """Format sections into WordPress block content."""
    formatted_sections = []
    
    for section in sections:
        formatted_section = formatter.format_section(section.title, section.content)
        formatted_sections.append(formatted_section)
    
    return '\n\n'.join(formatted_sections)


@app.route('/test-preview')
def test_preview():
    """Test preview with hardcoded data."""
    from types import SimpleNamespace
    
    # Create test case study data
    sections = [
        SimpleNamespace(
            title="Summary",
            content="Test Company faced significant mobile connectivity challenges in their urban office environment. With over 500 employees relying on mobile devices for daily operations, poor signal strength was impacting productivity and communication.\n\nThe company needed a comprehensive solution that could boost signals for all major carriers while accommodating the high user volume in their multi-story building.\n\nAfter implementing our advanced signal boosting technology, Test Company saw immediate improvements in connectivity, resulting in enhanced productivity and employee satisfaction.",
            section_type="summary"
        ),
        SimpleNamespace(
            title="The Client",
            content="Test Company is a leading technology firm specializing in software development and digital solutions. Based in downtown metropolitan area, the company operates from a modern 10-story office building housing 500+ employees.\n\nKnown for innovation and cutting-edge technology solutions, Test Company needed their internal infrastructure to match their technological expertise and support their team's connectivity requirements.",
            section_type="client"
        ),
        SimpleNamespace(
            title="The Challenges", 
            content="Test Company's downtown location presented unique connectivity challenges that were affecting business operations:\n\n• Building interference: The steel and concrete construction was blocking cellular signals\n• High user density: 500+ employees using mobile devices simultaneously\n• Multiple carriers: Employees used different mobile networks requiring universal coverage\n• Critical operations: Development teams needed reliable connectivity for remote access and collaboration\n\nThese connectivity issues were causing missed calls, slow data speeds, and decreased productivity across all departments.",
            section_type="challenges"
        ),
        SimpleNamespace(
            title="The Solution",
            content="We implemented a comprehensive mobile signal boosting system tailored to Test Company's specific needs:\n\n• Enterprise-grade signal boosters supporting all major carriers\n• Distributed antenna system across all 10 floors\n• High-capacity equipment to handle 500+ simultaneous users\n• Professional installation with minimal business disruption\n\nThe solution was designed to provide uniform coverage throughout the building while maintaining compliance with FCC regulations and carrier requirements.",
            section_type="solution"
        ),
        SimpleNamespace(
            title="The Results",
            content="The implementation delivered outstanding results that exceeded expectations:\n\n• 98% improvement in signal strength across all floors\n• Eliminated dropped calls and connectivity issues\n• Faster data speeds enabling better remote collaboration\n• Increased employee satisfaction and productivity\n• Zero business disruption during installation\n\nTest Company now enjoys reliable, enterprise-grade mobile connectivity that supports their innovative work environment and enables their team to stay connected and productive.\n\nIs your business experiencing similar connectivity challenges? Contact us today to learn how our proven solutions can transform your workplace connectivity and boost productivity.",
            section_type="results"
        )
    ]
    
    case_study = SimpleNamespace()
    case_study.title = "Case Study: Test Company - Mobile Connectivity Solution"
    case_study.sections = sections
    case_study.wordpress_content = "Test WordPress content..."
    case_study.client_name = "Test Company"
    
    current_date = datetime.now().strftime("%B %d, %Y")
    
    return render_template('uctel_website_preview.html', 
                         case_study=case_study,
                         current_date=current_date)


@app.route('/preview')
def website_preview_direct():
    """Direct website preview using temporary file data."""
    case_study_id = session.get('current_case_study_id')
    
    if not case_study_id:
        flash('Please generate a case study first to see the website preview.', 'info')
        return redirect(url_for('index'))
    
    # Load case study data from temporary file
    temp_file = os.path.join(tempfile.gettempdir(), f'case_study_{case_study_id}.json')
    
    if not os.path.exists(temp_file):
        flash('Case study data not found. Please generate a new case study.', 'warning')
        return redirect(url_for('index'))
    
    try:
        with open(temp_file, 'r', encoding='utf-8') as f:
            case_study_data = json.load(f)
        
        # Convert data back to case study object structure
        from types import SimpleNamespace
        
        sections = []
        for section_data in case_study_data['sections']:
            section = SimpleNamespace()
            section.title = section_data['title']
            section.content = section_data['content']
            section.section_type = section_data['section_type']
            sections.append(section)
        
        case_study = SimpleNamespace()
        case_study.title = case_study_data['title']
        case_study.sections = sections
        case_study.wordpress_content = case_study_data['wordpress_content']
        case_study.client_name = case_study_data.get('client_name', 'Client Name')
        
        current_date = datetime.now().strftime("%B %d, %Y")
        
        return render_template('uctel_website_preview.html', 
                             case_study=case_study,
                             current_date=current_date)
    
    except Exception as e:
        flash(f'Error loading case study preview: {str(e)}', 'error')
        return redirect(url_for('index'))


@app.route('/preview/<case_study_id>')
def website_preview(case_study_id):
    """Website preview page showing how the case study will look when published."""
    # In a real application, you'd fetch the case study from a database
    # For now, we'll use session data or redirect back if not available
    
    # This is a simplified version - in production you'd store case studies in a database
    # and retrieve them by ID. For now, we'll redirect to generate a new one.
    flash('Please generate a case study first to see the website preview.', 'info')
    return redirect(url_for('index'))


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'message': 'Case Study Generator is running'})


if __name__ == '__main__':
    # Check if running in development
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
