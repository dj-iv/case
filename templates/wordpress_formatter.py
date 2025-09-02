from jinja2 import Template
from typing import List


class WordPressFormatter:
    """Formats content into WordPress block format."""
    
    @staticmethod
    def format_heading(text: str, level: int = 2) -> str:
        """Format a heading in WordPress block format."""
        return f"""<!-- wp:heading -->
<h{level} class="wp-block-heading">{text}</h{level}>
<!-- /wp:heading -->"""
    
    @staticmethod
    def format_paragraph(text: str) -> str:
        """Format a paragraph in WordPress block format."""
        return f"""<!-- wp:paragraph -->
<p>{text}</p>
<!-- /wp:paragraph -->"""
    
    @staticmethod
    def format_list(items: List[str]) -> str:
        """Format a bulleted list in WordPress block format."""
        list_items = ""
        for item in items:
            list_items += f"""<!-- wp:list-item -->
<li>{item}</li>
<!-- /wp:list-item -->

"""
        
        return f"""<!-- wp:list -->
<ul>{list_items}</ul>
<!-- /wp:list -->"""
    
    @staticmethod
    def parse_content_for_lists(content: str) -> str:
        """Parse content and convert bullet points to WordPress list format."""
        lines = content.split('\n')
        result_lines = []
        current_list_items = []
        in_list = False
        
        for line in lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                # This is a list item
                item_text = line[1:].strip()
                current_list_items.append(item_text)
                in_list = True
            else:
                # Not a list item
                if in_list:
                    # End the current list
                    if current_list_items:
                        result_lines.append(WordPressFormatter.format_list(current_list_items))
                        current_list_items = []
                    in_list = False
                
                if line:  # Non-empty line
                    result_lines.append(WordPressFormatter.format_paragraph(line))
        
        # Handle any remaining list items
        if current_list_items:
            result_lines.append(WordPressFormatter.format_list(current_list_items))
        
        return '\n\n'.join(result_lines)
    
    @staticmethod
    def format_section(title: str, content: str) -> str:
        """Format a complete section with heading and content."""
        formatted_content = WordPressFormatter.parse_content_for_lists(content)
        heading = WordPressFormatter.format_heading(title)
        
        return f"{heading}\n\n{formatted_content}"
