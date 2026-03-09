# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

import pytest
from plane.bgtasks.email_notification_task import html_to_plain_text_with_urls


@pytest.mark.unit
class TestHtmlToPlainTextWithUrls:
    """Tests for html_to_plain_text_with_urls (#8673 - Improve TEXT version in multipart email)"""

    def test_removes_style_blocks(self):
        """Style blocks should not appear in plain text output."""
        html = """
        <html><head>
        <style>html { font-family: system-ui; } a:hover { color: blue; }</style>
        </head><body><p>Hello</p></body></html>
        """
        result = html_to_plain_text_with_urls(html)
        assert "font-family" not in result
        assert "a:hover" not in result
        assert "Hello" in result

    def test_removes_script_blocks(self):
        """Script blocks should not appear in plain text output."""
        html = "<html><body><script>alert('x')</script><p>Content</p></body></html>"
        result = html_to_plain_text_with_urls(html)
        assert "alert" not in result
        assert "Content" in result

    def test_preserves_link_urls(self):
        """Links should be converted to 'text (url)' format."""
        html = '<p>View <a href="https://example.com/issue/123">the issue</a> here.</p>'
        result = html_to_plain_text_with_urls(html)
        assert "the issue (https://example.com/issue/123)" in result
        assert "View" in result
        assert "here" in result

    def test_link_without_text_shows_url_only(self):
        """Links with no text (e.g. image-only) should show the URL."""
        html = '<a href="https://example.com"><img src="x.png"/></a>'
        result = html_to_plain_text_with_urls(html)
        assert "https://example.com" in result

    def test_mailto_links_preserved(self):
        """mailto: links should be preserved."""
        html = '<p>Contact <a href="mailto:user@example.com">user@example.com</a></p>'
        result = html_to_plain_text_with_urls(html)
        assert "user@example.com (mailto:user@example.com)" in result

    def test_multiple_links(self):
        """Multiple links should all have URLs preserved."""
        html = """
        <p><a href="https://a.com">Link A</a> and <a href="https://b.com">Link B</a></p>
        """
        result = html_to_plain_text_with_urls(html)
        assert "Link A (https://a.com)" in result
        assert "Link B (https://b.com)" in result

    def test_normalizes_whitespace(self):
        """Excessive whitespace should be collapsed."""
        html = "<p>  Hello   \n\n\n   World  </p>"
        result = html_to_plain_text_with_urls(html)
        assert "  " not in result or result.count("  ") < 2
        assert "Hello" in result
        assert "World" in result
