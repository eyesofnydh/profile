"""Build a sitemap from actual indexable static pages, without invented dates."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://eyesofnydh.netlify.app'
NS = 'http://www.sitemaps.org/schemas/sitemap/0.9'
IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1'


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = None
        self.indexable = True

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('name') == 'robots':
            self.indexable = 'noindex' not in attrs.get('content', '').lower()


def build():
    ET.register_namespace('', NS)
    ET.register_namespace('image', IMAGE_NS)
    root = ET.Element(f'{{{NS}}}urlset')
    filenames = ['index.html', 'travel.html'] + sorted(str(path.relative_to(ROOT)).replace('\\','/') for path in (ROOT/'photos').glob('*.html'))
    for filename in filenames:
        parser = Head()
        parser.feed((ROOT/filename).read_text(encoding='utf-8'))
        if not parser.indexable:
            continue
        expected = ORIGIN + ('/' if filename == 'index.html' else '/'+filename)
        if parser.canonical != expected:
            raise ValueError(f'Unexpected canonical for {filename}: {parser.canonical}')
        url = ET.SubElement(root, f'{{{NS}}}url')
        ET.SubElement(url, f'{{{NS}}}loc').text = expected
        if filename == 'index.html':
            text = (ROOT/'assets/js/photos.js').read_text(encoding='utf-8').split('=',1)[1].lstrip()
            for photo in json.JSONDecoder().raw_decode(text)[0]:
                path = Path('assets/images')/photo['file']
                if not (ROOT/path).is_file():
                    raise ValueError(f'Missing sitemap image: {path}')
                image = ET.SubElement(url, f'{{{IMAGE_NS}}}image')
                ET.SubElement(image, f'{{{IMAGE_NS}}}loc').text = f'{ORIGIN}/{path.as_posix()}'
    ET.indent(root)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root,encoding='unicode') + '\n'


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = build()
    target = ROOT/'sitemap.xml'
    if args.check:
        if not target.exists() or target.read_text(encoding='utf-8') != result:
            raise SystemExit('Sitemap is stale; run python tools/build-seo.py')
        print('PASS: sitemap matches indexable pages and existing image assets.')
    else:
        target.write_text(result,encoding='utf-8')
        print('Built sitemap.xml; noindex pages excluded.')
