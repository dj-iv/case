from pydantic import BaseModel, Field
from typing import List, Optional


class CaseStudyInput(BaseModel):
    """Input data for generating a case study."""
    client_name: str = Field(..., description="Name of the client/company")
    industry: str = Field(..., description="Industry or sector")
    main_challenge: str = Field(..., description="Primary challenge faced by the client")
    solution_provided: str = Field(..., description="Solution that was implemented")
    location: Optional[str] = Field(None, description="Location of the project")
    project_scale: Optional[str] = Field(None, description="Scale or size of the project")
    technologies_used: Optional[List[str]] = Field(None, description="Technologies or products used")
    additional_context: Optional[str] = Field(None, description="Any additional context or details")


class CaseStudySection(BaseModel):
    """Represents a section of the case study."""
    title: str
    content: str
    section_type: str  # summary, client, challenges, solution, results


class CaseStudy(BaseModel):
    """Complete case study structure."""
    title: str
    sections: List[CaseStudySection]
    wordpress_content: str
