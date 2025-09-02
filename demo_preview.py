#!/usr/bin/env python3
"""
Demo Website Preview Generator

Creates a demo preview using the generated case study.
"""

import os
from dotenv import load_dotenv
from flask import Flask, render_template
from datetime import datetime
from types import SimpleNamespace

# Load environment variables
load_dotenv()

app = Flask(__name__)

def create_demo_case_study():
    """Create a demo case study object from the generated content."""
    
    # Create sections based on the generated demo
    sections = [
        SimpleNamespace(
            title="Summary",
            content="""In the competitive landscape of higher education, providing a seamless learning experience for students is paramount. However, Northeastern University London faced a significant challenge with poor mobile connectivity on their dense urban campus, impacting the academic experience of 1300 students. In an age where connectivity is crucial for research, communication, and accessing course materials, this issue posed a major obstacle for both students and faculty.

The unique urban environment of St. Katharine Docks in London presented a particularly difficult challenge for improving mobile connectivity. With the campus spanning 2.5 floors and accommodating a large student population, traditional solutions were not sufficient to address the issue effectively. The need for a comprehensive, reliable solution that could cater to all major UK networks was imperative to ensure that students could stay connected and engaged in their academic pursuits.

To tackle this issue, Northeastern University London implemented CEL-FI QUATRA 1000 mobile signal boosters across their campus. This innovative solution provided a reliable boost to mobile signals for all major UK networks, ensuring that students could access the resources they needed without interruption. The results of this project not only improved the overall student experience but also enhanced the institution's reputation for providing a cutting-edge learning environment that prioritizes connectivity and accessibility.""",
            section_type="summary"
        ),
        SimpleNamespace(
            title="The Client",
            content="""Northeastern University London is a branch campus of the renowned Northeastern University based in Boston, Massachusetts. As a higher education institution, Northeastern University London offers a variety of undergraduate and graduate programs to students seeking an international academic experience in the heart of London, specifically located in St. Katharine Docks. With a focus on experiential learning and global engagement, the university prides itself on providing students with a unique educational experience that combines academic rigor with real-world application.

The university serves approximately 1300 students across 2.5 floors of modern academic facilities. Known for its innovative approach to education and commitment to student success, Northeastern University London needed to ensure that their technological infrastructure matched their educational excellence.""",
            section_type="client"
        ),
        SimpleNamespace(
            title="The Challenges",
            content="""Northeastern University London faced significant challenges when it came to providing adequate mobile connectivity for their 1300 students in the dense urban campus environment of St. Katharine Docks, London. The poor mobile connectivity was hindering the students' ability to access online resources, communicate with each other, and participate in virtual learning activities.

• Inadequate infrastructure: The existing network infrastructure was not designed to handle the high volume of mobile devices used by students, leading to frequent connectivity issues.

• Interference from surrounding buildings: The campus was surrounded by tall buildings that caused signal interference, further complicating the connectivity issues.

• Limited space for additional equipment: The campus was already densely populated, leaving little room for installing additional equipment to improve connectivity.

• High user demand: With 1300 students relying on mobile connectivity for their daily activities, the network had to be able to handle a high volume of users simultaneously.

These challenges were particularly difficult to overcome due to the technical nature of the issues and the constraints of the urban campus environment. Finding a solution that could improve mobile connectivity without disrupting the daily activities of the students and faculty was a delicate balance that needed to be achieved.""",
            section_type="challenges"
        ),
        SimpleNamespace(
            title="The Solution",
            content="""To address the connectivity challenges, Northeastern University London implemented CEL-FI QUATRA 1000 mobile signal boosters throughout their campus. This cutting-edge solution was specifically chosen for its ability to support all major UK networks and handle high user volumes.

The implementation included:

• CEL-FI QUATRA 1000 signal boosters: Multi-network compatibility supporting all major UK carriers
• CAT-6 cabling infrastructure: High-speed data transmission with minimal signal loss
• MIMO antennae deployment: Multiple Input, Multiple Output technology for enhanced coverage
• Strategic placement: Optimized positioning across 2.5 floors for maximum coverage

The CEL-FI QUATRA 1000 was the ideal choice because of its scalability, reliability, and ability to boost signals for multiple networks simultaneously. The solution was implemented with minimal disruption to campus operations and provided immediate improvements in connectivity quality.""",
            section_type="solution"
        ),
        SimpleNamespace(
            title="The Results",
            content="""The implementation of CEL-FI QUATRA 1000 mobile signal boosters at Northeastern University London delivered outstanding results that exceeded expectations. The transformation in connectivity was immediate and dramatically improved the overall campus experience.

Key improvements achieved:

• 95% increase in signal strength across all major UK networks
• Faster data speeds and clearer voice calls throughout the campus
• Uninterrupted access to online learning resources and communication platforms
• Enhanced student satisfaction and academic productivity

The project was completed within just one month, with minimal disruption to campus operations. Students and faculty immediately noticed the difference, reporting significant improvements in their ability to access course materials, participate in virtual classes, and stay connected with the university community.

Are you facing similar connectivity challenges at your educational institution? Contact our team today to discover how innovative signal boosting solutions can transform your campus connectivity and enhance the learning experience for your students and faculty.""",
            section_type="results"
        )
    ]
    
    case_study = SimpleNamespace()
    case_study.title = "Case Study: Northeastern University London - Transforming Campus Connectivity"
    case_study.sections = sections
    case_study.wordpress_content = "Generated WordPress content would be here..."
    
    return case_study

@app.route('/demo-preview')
def demo_preview():
    """Demo website preview page."""
    case_study = create_demo_case_study()
    current_date = datetime.now().strftime("%B %d, %Y")
    
    return render_template('website_preview.html', 
                         case_study=case_study,
                         current_date=current_date)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
