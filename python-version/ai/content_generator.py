import os
from openai import OpenAI
from typing import Dict, Any
from models.case_study import CaseStudyInput


class AIContentGenerator:
    """Handles AI-powered content generation using OpenAI."""
    
    def __init__(self, model: str = "gpt-3.5-turbo"):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        self.client = OpenAI(api_key=api_key)
        self.model = model
    
    def _generate_content(self, prompt: str) -> str:
        """Generate content using the configured model."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    
    def generate_summary(self, case_input: CaseStudyInput) -> str:
        """Generate the summary section."""
        prompt = f"""
        Write a compelling summary for a case study about {case_input.client_name} in the {case_input.industry} industry.
        
        Main challenge: {case_input.main_challenge}
        Solution provided: {case_input.solution_provided}
        {f"Location: {case_input.location}" if case_input.location else ""}
        {f"Project scale: {case_input.project_scale}" if case_input.project_scale else ""}
        
        Write 3-4 paragraphs that:
        1. Introduce the challenge in the industry context
        2. Highlight why this was particularly difficult
        3. Briefly mention the solution approach
        4. Tease the results/benefits
        
        Keep it engaging and professional. Focus on the business impact.
        """
        
        return self._generate_content(prompt)
    
    def generate_client_section(self, case_input: CaseStudyInput) -> str:
        """Generate the client description section."""
        prompt = f"""
        Write a professional description of the client for a case study.
        
        Client: {case_input.client_name}
        Industry: {case_input.industry}
        {f"Location: {case_input.location}" if case_input.location else ""}
        {f"Additional context: {case_input.additional_context}" if case_input.additional_context else ""}
        
        Write 2-3 paragraphs that:
        1. Introduce the client and what they do
        2. Provide relevant background about their business
        3. Set the context for why they needed this solution
        
        Make it informative but concise. Focus on details relevant to the case study.
        """
        
        return self._generate_content(prompt)
    
    def generate_challenges_section(self, case_input: CaseStudyInput) -> str:
        """Generate the challenges section."""
        prompt = f"""
        Write a detailed challenges section for a case study.
        
        Client: {case_input.client_name}
        Industry: {case_input.industry}
        Main challenge: {case_input.main_challenge}
        {f"Location: {case_input.location}" if case_input.location else ""}
        {f"Project scale: {case_input.project_scale}" if case_input.project_scale else ""}
        
        Write content that:
        1. Introduces the challenges with context
        2. Lists 3-4 specific challenges as bullet points
        3. Explains why these challenges were particularly difficult
        4. Mentions any time constraints or special requirements
        
        Format with a brief intro paragraph, then a bulleted list of challenges, then a concluding paragraph.
        Focus on technical and business challenges that make this case study compelling.
        """
        
        return self._generate_content(prompt)
    
    def generate_solution_section(self, case_input: CaseStudyInput) -> str:
        """Generate the solution section."""
        prompt = f"""
        Write a detailed solution section for a case study.
        
        Client: {case_input.client_name}
        Solution provided: {case_input.solution_provided}
        {f"Technologies used: {', '.join(case_input.technologies_used)}" if case_input.technologies_used else ""}
        {f"Project scale: {case_input.project_scale}" if case_input.project_scale else ""}
        
        Write content that:
        1. Explains the solution approach
        2. Details the specific technologies or methods used
        3. Lists key benefits/features as bullet points
        4. Describes the implementation process
        5. Mentions any partnerships or collaboration
        
        Make it technical enough to be credible but accessible to business readers.
        Focus on why this solution was the right choice.
        """
        
        return self._generate_content(prompt)
    
    def generate_results_section(self, case_input: CaseStudyInput) -> str:
        """Generate the results section."""
        prompt = f"""
        Write a compelling results section for a case study.
        
        Client: {case_input.client_name}
        Solution provided: {case_input.solution_provided}
        Original challenge: {case_input.main_challenge}
        
        Write content that:
        1. Describes the positive outcomes achieved
        2. Includes specific improvements (can be realistic but impressive)
        3. Mentions implementation timeline
        4. Concludes with client satisfaction
        5. Includes a call-to-action paragraph for similar clients
        
        Focus on measurable business benefits and user experience improvements.
        End with an engaging call-to-action that encourages similar prospects to get in touch.
        """
        
        return self._generate_content(prompt)
