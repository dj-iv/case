#!/usr/bin/env python3
"""
Case Study Content Generator

An AI-powered tool for generating case study content in WordPress format.
"""

import os
import sys
import click
from dotenv import load_dotenv
from typing import Optional, List

# Load environment variables
load_dotenv()

from models import CaseStudyInput, CaseStudy, CaseStudySection
from ai import AIContentGenerator
from templates import WordPressFormatter


class CaseStudyGenerator:
    """Main case study generator class."""
    
    def __init__(self):
        self.ai_generator = AIContentGenerator()
        self.formatter = WordPressFormatter()
    
    def generate_case_study(self, case_input: CaseStudyInput) -> CaseStudy:
        """Generate a complete case study."""
        
        click.echo(f"Generating case study for {case_input.client_name}...")
        
        # Generate content for each section
        click.echo("📝 Generating summary...")
        summary_content = self.ai_generator.generate_summary(case_input)
        
        click.echo("🏢 Generating client section...")
        client_content = self.ai_generator.generate_client_section(case_input)
        
        click.echo("⚠️  Generating challenges section...")
        challenges_content = self.ai_generator.generate_challenges_section(case_input)
        
        click.echo("🔧 Generating solution section...")
        solution_content = self.ai_generator.generate_solution_section(case_input)
        
        click.echo("📊 Generating results section...")
        results_content = self.ai_generator.generate_results_section(case_input)
        
        # Create sections
        sections = [
            CaseStudySection(title="Summary", content=summary_content, section_type="summary"),
            CaseStudySection(title="The Client", content=client_content, section_type="client"),
            CaseStudySection(title="The Challenges", content=challenges_content, section_type="challenges"),
            CaseStudySection(title="The Solution", content=solution_content, section_type="solution"),
            CaseStudySection(title="The Results", content=results_content, section_type="results")
        ]
        
        # Format for WordPress
        click.echo("🎨 Formatting for WordPress...")
        wordpress_content = self._format_wordpress_content(sections)
        
        # Generate title
        title = f"Case Study: {case_input.client_name} - {case_input.main_challenge}"
        
        return CaseStudy(
            title=title,
            sections=sections,
            wordpress_content=wordpress_content
        )
    
    def _format_wordpress_content(self, sections: List[CaseStudySection]) -> str:
        """Format sections into WordPress block content."""
        formatted_sections = []
        
        for section in sections:
            formatted_section = self.formatter.format_section(section.title, section.content)
            formatted_sections.append(formatted_section)
        
        return '\n\n'.join(formatted_sections)


@click.command()
@click.option('--client', '-c', required=True, help='Client/company name')
@click.option('--industry', '-i', required=True, help='Industry or sector')
@click.option('--challenge', '-ch', required=True, help='Main challenge faced')
@click.option('--solution', '-s', required=True, help='Solution provided')
@click.option('--location', '-l', help='Project location')
@click.option('--scale', help='Project scale or size')
@click.option('--technologies', '-t', help='Technologies used (comma-separated)')
@click.option('--context', help='Additional context or details')
@click.option('--output', '-o', help='Output file path (default: stdout)')
def main(client: str, industry: str, challenge: str, solution: str, 
         location: Optional[str], scale: Optional[str], 
         technologies: Optional[str], context: Optional[str], 
         output: Optional[str]):
    """Generate AI-powered case study content in WordPress format."""
    
    # Check for OpenAI API key
    if not os.getenv('OPENAI_API_KEY'):
        click.echo("❌ Error: OPENAI_API_KEY environment variable is required", err=True)
        click.echo("Please create a .env file with your OpenAI API key:", err=True)
        click.echo("OPENAI_API_KEY=your_api_key_here", err=True)
        sys.exit(1)
    
    # Parse technologies
    tech_list = None
    if technologies:
        tech_list = [tech.strip() for tech in technologies.split(',')]
    
    # Create input model
    case_input = CaseStudyInput(
        client_name=client,
        industry=industry,
        main_challenge=challenge,
        solution_provided=solution,
        location=location,
        project_scale=scale,
        technologies_used=tech_list,
        additional_context=context
    )
    
    try:
        # Generate case study
        generator = CaseStudyGenerator()
        case_study = generator.generate_case_study(case_input)
        
        # Output result
        if output:
            with open(output, 'w', encoding='utf-8') as f:
                f.write(case_study.wordpress_content)
            click.echo(f"✅ Case study generated and saved to {output}")
        else:
            click.echo("\n" + "="*60)
            click.echo(f"CASE STUDY: {case_study.title}")
            click.echo("="*60)
            click.echo(case_study.wordpress_content)
            
    except Exception as e:
        click.echo(f"❌ Error generating case study: {str(e)}", err=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
