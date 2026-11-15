import { describe, expect, test } from 'vitest';
import { parseSvg } from './svg';

describe('parseSvg', () => {
  test('reads the root attributes, keeping the case of their names', () => {
    const { attributes } = parseSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5"><path d="M0 0"/></svg>\n');

    expect(attributes).toEqual({ xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', 'stroke-width': '1.5' });
  });

  test('keeps the content as written', () => {
    const { innerHTML } = parseSvg('<svg viewBox="0 0 1 1">\n  <path d="M0 0"/>\n  <!-- note -->\n</svg>');

    expect(innerHTML).toBe('\n  <path d="M0 0"/>\n  <!-- note -->\n');
  });

  test('ends at the last closing tag, so a nested svg stays in the content', () => {
    expect(parseSvg('<svg><g><svg x="1"></svg></g></svg>').innerHTML).toBe('<g><svg x="1"></svg></g>');
  });

  test('skips an XML prolog, a doctype and comments before the root, even a comment mentioning <svg>', () => {
    const source = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
      '<!-- Generator: Figma <svg x="9"> -->',
      '<svg viewBox="0 0 1 1"><path/></svg>'
    ].join('\n');

    expect(parseSvg(source)).toEqual({ attributes: { viewBox: '0 0 1 1' }, innerHTML: '<path/>' });
  });

  test('decodes entities in attribute values', () => {
    const { attributes } = parseSvg(`<svg aria-label="Tom &amp; Jerry &quot;x&quot; &apos;y&apos; &#39;z&#39; &#x41;&#66; &lt;&gt;" data-q='a"b'></svg>`);

    expect(attributes).toEqual({ 'aria-label': `Tom & Jerry "x" 'y' 'z' AB <>`, 'data-q': 'a"b' });
  });

  test('leaves a character reference beyond Unicode as written', () => {
    const { attributes } = parseSvg('<svg data-a="&#x110000;" data-b="&#99999999;"></svg>');

    expect(attributes).toEqual({ 'data-a': '&#x110000;', 'data-b': '&#99999999;' });
  });

  test('reads unquoted and boolean attributes', () => {
    expect(parseSvg('<svg width=24 height = "24" focusable></svg>').attributes).toEqual({ width: '24', height: '24', focusable: '' });
  });

  test('reads a self-closing root as empty', () => {
    expect(parseSvg('<svg viewBox="0 0 1 1"/>')).toEqual({ attributes: { viewBox: '0 0 1 1' }, innerHTML: '' });
  });

  test('throws when the source is not an svg', () => {
    expect(() => parseSvg('<div></div>')).toThrow(/svg/);
    expect(() => parseSvg('<svg viewBox="0 0 1 1"><path/>')).toThrow(/svg/);
  });
});
