import { Page } from 'playwright';

export async function inspectPageElements(page: Page, context: string = ''): Promise<string> {
  try {
    const pageInfo = await page.evaluate(() => {
      // Get all input elements
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        tag: 'input',
        name: input.name,
        id: input.id,
        type: input.type,
        placeholder: input.placeholder,
        ariaLabel: input.getAttribute('aria-label'),
        classes: input.className,
        visible: input.offsetParent !== null
      }));

      // Get all button elements
      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        tag: 'button',
        id: button.id,
        type: button.type,
        text: button.textContent?.trim(),
        ariaLabel: button.getAttribute('aria-label'),
        title: button.title,
        classes: button.className,
        visible: button.offsetParent !== null
      }));

      // Get form elements
      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        tag: 'form',
        id: form.id,
        action: form.action,
        method: form.method,
        role: form.getAttribute('role'),
        classes: form.className
      }));

      return {
        url: window.location.href,
        title: document.title,
        inputs: inputs.filter(i => i.visible),
        buttons: buttons.filter(b => b.visible),
        forms,
        searchElements: {
          searchInputs: inputs.filter(i => 
            i.visible && (
              i.name?.includes('q') || 
              i.placeholder?.toLowerCase().includes('search') ||
              i.ariaLabel?.toLowerCase().includes('search') ||
              i.id?.toLowerCase().includes('search')
            )
          ),
          searchButtons: buttons.filter(b => 
            b.visible && (
              b.text?.toLowerCase().includes('search') ||
              b.ariaLabel?.toLowerCase().includes('search') ||
              b.title?.toLowerCase().includes('search')
            )
          )
        }
      };
    });

    return `
=== PAGE INSPECTION REPORT ${context ? `(${context})` : ''} ===
URL: ${pageInfo.url}
Title: ${pageInfo.title}

🔍 SEARCH INPUTS FOUND (${pageInfo.searchElements.searchInputs.length}):
${pageInfo.searchElements.searchInputs.map(input => 
  `- ${input.tag}[name="${input.name}"][id="${input.id}"][type="${input.type}"]
    Placeholder: "${input.placeholder}"
    Aria-label: "${input.ariaLabel}"
    Classes: "${input.classes}"`
).join('\n')}

🔘 SEARCH BUTTONS FOUND (${pageInfo.searchElements.searchButtons.length}):
${pageInfo.searchElements.searchButtons.map(button => 
  `- ${button.tag}[id="${button.id}"][type="${button.type}"]
    Text: "${button.text}"
    Aria-label: "${button.ariaLabel}" 
    Title: "${button.title}"
    Classes: "${button.classes}"`
).join('\n')}

📝 ALL FORMS (${pageInfo.forms.length}):
${pageInfo.forms.map(form => 
  `- form[id="${form.id}"][action="${form.action}"][role="${form.role}"]`
).join('\n')}

📋 ALL INPUTS (${pageInfo.inputs.length}):
${pageInfo.inputs.slice(0, 10).map(input => 
  `- ${input.tag}[name="${input.name}"][id="${input.id}"][type="${input.type}"]`
).join('\n')}${pageInfo.inputs.length > 10 ? '\n... and more' : ''}

🔘 ALL BUTTONS (${pageInfo.buttons.length}):
${pageInfo.buttons.slice(0, 10).map(button => 
  `- ${button.tag}[id="${button.id}"] "${button.text}"`
).join('\n')}${pageInfo.buttons.length > 10 ? '\n... and more' : ''}
`;
  } catch (error) {
    return `Error inspecting page: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
} 