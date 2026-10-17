import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Image from '../media/Image.astro';
import Card from './Card.astro';

const remote = 'https://example.com/prints/heron.jpg';

async function renderCard(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return (await render(Card, { props, slots })).querySelector('.card')!;
}

/** Renders the Image component to HTML, to place it in a card slot as an author would. */
async function imageHtml(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(Image, { props });
}

describe('Card', () => {
  test('renders only the body when only the default slot is given', async () => {
    const card = await renderCard({}, { default: '<p>A print on fine art paper.</p>' });

    expect(card.querySelector('.card-body p')?.textContent).toBe('A print on fine art paper.');
    expect(card.querySelector('.card-header')).toBeNull();
    expect(card.querySelector('.card-media')).toBeNull();
    expect(card.querySelector('.card-footer')).toBeNull();
  });

  test('renders every area that is given', async () => {
    const card = await renderCard({}, {
      header: '<h3>Heron at dawn</h3>',
      media: '<img src="/heron.jpg" alt="A heron">',
      default: '<p>Body</p>',
      footer: '<span>45 $</span>'
    });

    expect(card.querySelector('.card-header h3')?.textContent).toBe('Heron at dawn');
    expect(card.querySelector('.card-media img')).not.toBeNull();
    expect(card.querySelector('.card-body p')?.textContent).toBe('Body');
    expect(card.querySelector('.card-footer span')?.textContent).toBe('45 $');
  });

  test('renders no body when there is no default slot', async () => {
    const card = await renderCard({}, { header: '<h3>Title only</h3>' });

    expect(card.querySelector('.card-header')).not.toBeNull();
    expect(card.querySelector('.card-body')).toBeNull();
  });

  test('is an article by default and can render as another element', async () => {
    expect((await renderCard({}, { default: 'Body' })).tagName).toBe('ARTICLE');
    expect((await renderCard({ as: 'div' }, { default: 'Body' })).tagName).toBe('DIV');
  });

  test('accepts the Image component in its media area, credit footer included', async () => {
    const media = await imageHtml({ src: remote, alt: 'A heron', credit: 'Kevin Verreault 2024' });
    const card = await renderCard({}, { media, default: 'Body' });

    expect(card.querySelector('.card-media figure img')?.getAttribute('alt')).toBe('A heron');
    expect(card.querySelector('.card-media figcaption')?.textContent.trim()).toBe('© Kevin Verreault 2024');
  });

  test('renders exactly one anchor, the card itself, when it links somewhere', async () => {
    const media = await imageHtml({ src: remote, alt: 'A heron', credit: 'Kevin Verreault 2024' });
    const root = await render(Card, {
      props: { href: '/boutique/heron' },
      slots: { header: '<h3>Heron at dawn</h3>', media, default: '<p>Body</p>', footer: '45 $' }
    });
    const anchors = root.querySelectorAll('a');

    expect(anchors).toHaveLength(1);
    expect(anchors[0].getAttribute('href')).toBe('/boutique/heron');
    expect(anchors[0].classList.contains('card')).toBe(true);
    expect(anchors[0].classList.contains('linked')).toBe(true);
    expect(anchors[0].querySelector('figcaption')).not.toBeNull();
  });

  test.each([
    ['a link', '<a href="/bio">Bio</a>'],
    ['a button', '<button>Add to cart</button>'],
    ['an input', '<input name="quantity">'],
    ['a label', '<label>Quantity</label>'],
    ['a video with controls', '<video src="/clip.mp4" controls></video>'],
    ['a focusable element', '<span tabindex="0">Focus me</span>']
  ])('fails when a linked card contains %s', async (_, content) => {
    await expect(renderCard({ href: '/boutique/heron' }, { footer: content })).rejects.toThrow(/interactive/);
  });

  test('fails when a linked card is also given another element', async () => {
    await expect(renderCard({ href: '/boutique/heron', as: 'div' }, { default: 'Body' })).rejects.toThrow(/as/);
  });

  test('allows interactive content when the card does not link', async () => {
    const card = await renderCard({}, { footer: '<button>Add to cart</button>' });

    expect(card.querySelector('.card-footer button')).not.toBeNull();
  });

  test('passes through native attributes', async () => {
    const card = await renderCard({ id: 'heron', class: 'featured', 'aria-label': 'Heron print' }, { default: 'Body' });

    expect(card.id).toBe('heron');
    expect(card.classList.contains('featured')).toBe(true);
    expect(card.getAttribute('aria-label')).toBe('Heron print');
  });

  test('passes link attributes to the anchor of a linked card', async () => {
    const card = await renderCard({ href: '/x', target: '_blank', rel: 'noopener' }, { default: 'Body' });

    expect(card.tagName).toBe('A');
    expect(card.getAttribute('target')).toBe('_blank');
    expect(card.getAttribute('rel')).toBe('noopener');
  });
});
