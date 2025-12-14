# Palette's Journal - Job Tracking Application

## 2025-12-14 - Search Input Accessibility Pattern

**Learning:** The job tracking application had a common accessibility anti-pattern: a search input with only placeholder text and no proper label element. This violates WCAG 2.1 Level A (3.3.2 Labels or Instructions) because placeholders disappear when users type and screen readers don't announce them the same way as proper labels.

**Action:** For future UX improvements in this app:
1. Always check form inputs for proper `<label>` elements with `htmlFor` attributes
2. Consider adding helper text with `aria-describedby` for additional context
3. Ensure language consistency throughout the UI (this app mixes Indonesian and English)
4. Use `focus:ring-2` for enhanced keyboard navigation visibility
5. Look for other form inputs that might have the same pattern (check modal forms)

**Impact:** This small change (<20 lines) significantly improves accessibility for screen reader users and provides better visual clarity for all users. The search field is now WCAG compliant and provides a professional, polished experience.

**Next Steps to Consider:**
- Review other inputs in the ApplicationModal component (lines 275-399) for similar accessibility issues
- Consider adding aria-labels to the icon-only action buttons in ApplicationCard component
- Check if the modal forms have proper label associations
