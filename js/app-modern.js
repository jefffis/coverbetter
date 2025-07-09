// CoverBetter - Modernized Version (No jQuery)
class CoverBetter {
    constructor() {
        this.textFile = null;
        this.localDraft = {};
        this.randomString = Math.random().toString(36).substring(7);
        this.originalCoverLetterContent = '';
        
        this.elements = {
            form: document.querySelector('form'),
            coverLetter: document.getElementById('cover-letter'),
            downloadFile: document.getElementById('download-file'),
            company: document.getElementById('company'),
            title: document.getElementById('title'),
            location: document.getElementById('location'),
            saveDraft: document.getElementById('save-local-draft'),
            localDrafts: document.getElementById('local-drafts'),
            draftList: document.getElementById('draft-list'),
            coverLetterText: document.getElementById('cover-letter-text'),
            downloadLink: document.getElementById('downloadlink')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkForExistingDrafts();
        this.setupMobileBehavior();
        this.loadFonts();
        // Disable Download button by default
        this.elements.downloadFile.disabled = true;
    }
    
    setupEventListeners() {
        // Form input listeners
        this.elements.company.addEventListener('input', () => this.updatePlaceholder('company'));
        this.elements.title.addEventListener('input', () => this.updatePlaceholder('title'));
        this.elements.location.addEventListener('input', () => this.updatePlaceholder('location'));
        
        // Form submission
        this.elements.form.addEventListener('submit', (e) => e.preventDefault());
        
        // Button listeners
        this.elements.downloadFile.addEventListener('click', () => this.downloadTextFile());
        this.elements.saveDraft.addEventListener('click', () => this.saveLocalDraft());
        
        // Draft management
        this.elements.localDrafts.addEventListener('click', () => this.showDraftList());
        this.elements.draftList.querySelector('button').addEventListener('click', () => this.hideDraftList());
        
        // Cover letter content changes
        this.originalCoverLetterContent = this.elements.coverLetter.innerHTML;
        this.elements.coverLetter.addEventListener('input', () => this.checkCoverLetterChanges());
        
        // Draft list item clicks
        document.body.addEventListener('click', (e) => {
            if (e.target.matches('#draft-list a')) {
                this.loadDraft(e.target);
            }
        });
    }
    
    updatePlaceholder(fieldType) {
        const input = this.elements[fieldType];
        const dataRel = input.dataset.rel;
        const value = input.value;
        
        // Update all elements with the corresponding class
        document.querySelectorAll(`.${dataRel}`).forEach(element => {
            element.textContent = value;
        });
        
        // Enable save and download buttons if any field has content
        const hasContent = this.elements.company.value || this.elements.title.value || this.elements.location.value;
        this.elements.saveDraft.disabled = !hasContent;
        this.elements.downloadFile.disabled = !hasContent;
    }
    
    checkCoverLetterChanges() {
        const hasChanges = this.elements.coverLetter.innerHTML !== this.originalCoverLetterContent;
        this.elements.saveDraft.disabled = !hasChanges;
        this.elements.downloadFile.disabled = !hasChanges;
    }
    
    checkForExistingDrafts() {
        if (localStorage.getItem('has-local-drafts')) {
            this.showLocalDrafts();
        }
    }
    
    setupMobileBehavior() {
        if (this.isMobile()) {
            this.elements.downloadFile.textContent = 'Email This';
        }
    }
    
    isMobile() {
        return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }
    
    async loadFonts() {
        try {
            const font = new FontFaceObserver('Fira Mono', { weight: 300, weight: 700 });
            await font.load();
            document.documentElement.classList.add('fonts-loaded');
        } catch (error) {
            console.warn('Font loading failed:', error);
        }
    }
    
    saveLocalDraft() {
        const button = this.elements.saveDraft;
        
        if (!localStorage.getItem('has-local-drafts')) {
            localStorage.setItem('has-local-drafts', 'true');
        }
        
        this.localDraft = {
            draftId: this.randomString,
            company: this.elements.company.value,
            title: this.elements.title.value,
            location: this.elements.location.value,
            coverLetter: this.replaceAllText(this.elements.coverLetter.innerHTML, "'", '&#39;')
        };
        
        localStorage.setItem(`local-drafts-${this.randomString}`, JSON.stringify(this.localDraft));
        this.showLocalDrafts();
        
        // Visual feedback
        setTimeout(() => button.classList.add('submitted'), 125);
        setTimeout(() => {
            button.classList.remove('submitted');
            button.blur();
            this.showSuccessBanner('Shwing! The draft was saved.');
        }, 1500);
        
        button.disabled = true;
    }
    
    showLocalDrafts() {
        this.elements.localDrafts.style.display = 'block';
        // Clear existing drafts
        const draftContainer = this.elements.draftList.querySelector('div');
        draftContainer.innerHTML = '';
        let draftCount = 1;
        const currentDraftId = this.randomString;
        for (const key in localStorage) {
            if (localStorage[key] !== 'true' && typeof localStorage[key] === 'string') {
                try {
                    const draft = JSON.parse(localStorage[key]);
                    const displayName = draft.company !== '' ? draft.company : 'Untitled Draft';
                    // Create span for draft entry
                    const span = document.createElement('span');
                    span.style.display = 'flex';
                    span.style.alignItems = 'center';
                    span.style.justifyContent = 'space-between';
                    span.style.marginBottom = '4px';
                    span.style.position = 'relative'; // Ensure relative positioning
                    // Draft link
                    const a = document.createElement('a');
                    a.textContent = displayName;
                    a.setAttribute('data-draft-id', draft.draftId);
                    a.setAttribute('data-company', draft.company);
                    a.setAttribute('data-title', draft.title);
                    a.setAttribute('data-location', draft.location);
                    a.setAttribute('data-cover-letter', this.escapeForDataAttr(draft.coverLetter));
                    a.style.flex = '1 1 auto';
                    a.style.overflow = 'hidden';
                    a.style.textOverflow = 'ellipsis';
                    a.style.whiteSpace = 'nowrap';
                    // Delete button
                    const del = document.createElement('button');
                    del.textContent = 'Delete';
                    del.title = 'Delete draft';
                    del.style.color = '#666';
                    del.style.background = 'none';
                    del.style.border = 'none';
                    del.style.cursor = 'pointer';
                    del.style.fontSize = '14px';
                    del.style.marginLeft = '8px';
                    del.style.flex = '0 0 auto';
                    del.style.position = 'absolute';
                    del.style.right = '0';
                    del.style.top = '50%';
                    del.style.transform = 'translateY(-50%)';
                    del.setAttribute('aria-label', 'Delete draft');
                    // Only allow delete if not the current draft loaded in editor
                    if (draft.draftId !== currentDraftId) {
                        del.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (confirm('Are you sure you want to delete this draft?')) {
                                this.deleteDraft(key, span);
                            }
                        });
                    } else {
                        del.disabled = true;
                        del.style.opacity = '0.3';
                        del.title = 'Cannot delete draft currently loaded in editor';
                    }
                    span.appendChild(a);
                    span.appendChild(del);
                    draftContainer.appendChild(span);
                    draftCount++;
                } catch (error) {
                    console.warn('Failed to parse draft:', error);
                }
            }
        }
    }

    deleteDraft(key, spanElement) {
        localStorage.removeItem(key);
        if (spanElement && spanElement.parentNode) {
            spanElement.parentNode.removeChild(spanElement);
        }
        // If no drafts left, hide the drafts UI
        let hasDrafts = false;
        for (const k in localStorage) {
            if (localStorage[k] !== 'true' && typeof localStorage[k] === 'string') {
                hasDrafts = true;
                break;
            }
        }
        if (!hasDrafts) {
            this.elements.localDrafts.style.display = 'none';
            this.hideDraftList();
        }
        this.showSuccessBanner('Draft deleted.');
    }
    
    loadDraft(draftElement) {
        this.elements.company.value = draftElement.dataset.company;
        this.elements.title.value = draftElement.dataset.title;
        this.elements.location.value = draftElement.dataset.location;
        this.elements.coverLetter.innerHTML = draftElement.dataset.coverLetter;
        
        this.hideDraftList();
        this.elements.saveDraft.disabled = true;
        this.randomString = draftElement.dataset.draftId;
        
        // Update placeholders
        this.updatePlaceholder('company');
        this.updatePlaceholder('title');
        this.updatePlaceholder('location');
    }
    
    showDraftList() {
        this.elements.draftList.classList.add('shown');
    }
    
    hideDraftList() {
        this.elements.draftList.classList.remove('shown');
    }
    
    async downloadTextFile() {
        const button = this.elements.downloadFile;
        setTimeout(() => button.classList.add('submitted'), 125);
        setTimeout(async () => {
            let textContent = '';
            const coverLetterElement = this.elements.coverLetter;
            const textArea = this.elements.coverLetterText;

            // Convert HTML to plain text, preserving paragraphs
            let html = coverLetterElement.innerHTML;
            html = html.replace(/<br[^>]*>/gi, '\n')
                .replace(/<li>/gi, '\n- ')
                .replace(/<\/li>/gi, '')
                .replace(/<ul>|<ol>|<\/ul>|<\/ol>/gi, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            let paragraphs = html.split(/<\/?div>|<\/?p>|\n{2,}/gi)
                .map(p => p.replace(/<[^>]+>/g, '').trim())
                .filter(p => p.length > 0);
            textContent = paragraphs.join('\r\n\r\n');
            textArea.value = textContent;

            if (!this.isMobile()) {
                if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }
                const { jsPDF } = window.jspdf || window;
                const doc = new jsPDF({
                    unit: 'pt',
                    format: 'letter'
                });
                doc.setFont('courier', 'normal');
                let y = 40;
                const leftMargin = 40;
                const maxWidth = 520;
                const lineHeight = 18;
                doc.setFontSize(12);
                paragraphs.forEach((para, idx) => {
                    const lines = doc.splitTextToSize(para, maxWidth);
                    doc.text(lines, leftMargin, y, { maxWidth, lineHeightFactor: 1.5 });
                    y += lines.length * lineHeight + lineHeight;
                });
                // Add footer: Powered by Coverbetter
                y += 10; // Extra space after last paragraph
                const footerText = 'Powered by ';
                const brandText = 'Coverbetter';
                const url = 'https://coverbetter.co/?ref=PDF-download';
                doc.setFont('courier', 'normal');
                doc.setFontSize(12);
                doc.setTextColor(102, 102, 102); // #666
                // Draw 'Powered by '
                doc.text(footerText, leftMargin, y);
                // Measure width to position 'Coverbetter'
                const footerTextWidth = doc.getTextWidth(footerText);
                // Draw 'Coverbetter' underlined and as a link
                doc.textWithLink(brandText, leftMargin + footerTextWidth, y, { url });
                // Underline 'Coverbetter'
                const brandWidth = doc.getTextWidth(brandText);
                doc.setLineWidth(0.7);
                doc.line(leftMargin + footerTextWidth, y + 2, leftMargin + footerTextWidth + brandWidth, y + 2);
                // Reset color
                doc.setTextColor(0, 0, 0);
                // Filename: {company}-cover-letter.pdf
                let company = this.elements.company.value.trim() || 'cover-letter';
                company = company.replace(/[^a-z0-9\-_]+/gi, '-');
                doc.save(`${company}-cover-letter.pdf`);
            } else {
                window.location.href = `mailto:?subject=The cover letter I wrote with CoverBetter&body=${encodeURIComponent(textContent)}`;
            }
        }, 500);
        setTimeout(() => {
            button.classList.remove('submitted');
            button.blur();
            if (!this.isMobile()) {
                this.showSuccessBanner('Shwing! PDF downloaded.');
            }
        }, 1500);
    }
    
    makeTextFile(content) {
        const blob = new Blob([content], { type: 'text/plain' });
        
        if (this.textFile !== null) {
            URL.revokeObjectURL(this.textFile);
        }
        
        this.textFile = URL.createObjectURL(blob);
        return this.textFile;
    }
    
    showSuccessBanner(message) {
        const banner = document.createElement('div');
        banner.id = 'success';
        banner.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(banner);
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 3000);
    }
    
    replaceAllText(text, search, replace) {
        if (!text) return text;
        return text.replace(new RegExp(search, 'g'), replace);
    }

    // Helper to escape both single and double quotes for data attributes
    escapeForDataAttr(text) {
        if (!text) return text;
        return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CoverBetter();
}); 