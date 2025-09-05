#!/usr/bin/env python3
"""
Example usage of the Case Study Generator
"""

from models import CaseStudyInput
from ai import AIContentGenerator
from templates import WordPressFormatter
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def example_usage():
    """Example of how to use the case study generator programmatically."""
    
    # Example input based on the UCtel case study
    case_input = CaseStudyInput(
        client_name="Northeastern University London",
        industry="Higher Education",
        main_challenge="Poor mobile connectivity in dense urban campus environment",
        solution_provided="CEL-FI QUATRA 1000 mobile signal boosters for all major UK networks",
        location="St. Katharine Docks, London",
        project_scale="2.5 floors, 1300 students",
        technologies_used=["CEL-FI QUATRA 1000", "CAT-6 cabling", "MIMO antennae"],
        additional_context="Converted warehouse building with modern materials that block signal"
    )
    
    print("🚀 Starting case study generation...")
    print(f"Client: {case_input.client_name}")
    print(f"Industry: {case_input.industry}")
    print(f"Challenge: {case_input.main_challenge}")
    print("-" * 50)
    
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Please set OPENAI_API_KEY in your .env file")
        return
    
    try:
        # Initialize generators
        ai_generator = AIContentGenerator()
        formatter = WordPressFormatter()
        
        # Generate each section
        print("📝 Generating summary...")
        summary = ai_generator.generate_summary(case_input)
        
        print("🏢 Generating client section...")
        client = ai_generator.generate_client_section(case_input)
        
        print("⚠️  Generating challenges...")
        challenges = ai_generator.generate_challenges_section(case_input)
        
        print("🔧 Generating solution...")
        solution = ai_generator.generate_solution_section(case_input)
        
        print("📊 Generating results...")
        results = ai_generator.generate_results_section(case_input)
        
        # Format for WordPress
        print("🎨 Formatting for WordPress...")
        
        formatted_summary = formatter.format_section("Summary", summary)
        formatted_client = formatter.format_section("The Client", client)
        formatted_challenges = formatter.format_section("The Challenges", challenges)
        formatted_solution = formatter.format_section("The Solution", solution)
        formatted_results = formatter.format_section("The Results", results)
        
        # Combine all sections
        full_content = '\n\n'.join([
            formatted_summary,
            formatted_client, 
            formatted_challenges,
            formatted_solution,
            formatted_results
        ])
        
        print("\n" + "="*60)
        print("GENERATED CASE STUDY")
        print("="*60)
        print(full_content)
        
        # Save to file
        with open('example_case_study.txt', 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"\n✅ Case study saved to 'example_case_study.txt'")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    example_usage()
