import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import Tooltip from '../overlay/Tooltip.astro';
import Button from './Button.astro';

describe('Button', () => {
  test('renders a button with its slot content', async () => {
    const button = (await render(Button, { slots: { default: 'Save' } })).querySelector('button');

    expect(button?.textContent?.trim()).toBe('Save');
  });

  test('applies the default variant classes', async () => {
    const button = (await render(Button)).querySelector('button')!;

    expect(button.classList.contains('primary')).toBe(true);
    expect(button.classList.contains('plain')).toBe(true);
    expect(button.classList.contains('text-md')).toBe(true);
  });

  test('applies the chosen variant, decoration, size and shape', async () => {
    const button = (await render(Button, {
      props: { variant: 'danger', decoration: 'outline', size: 'large', shape: 'rounded' }
    })).querySelector('button')!;

    expect(button.classList.contains('danger')).toBe(true);
    expect(button.classList.contains('outline')).toBe(true);
    expect(button.classList.contains('text-xl')).toBe(true);
    expect(button.classList.contains('rounded')).toBe(true);
    expect(button.classList.contains('primary')).toBe(false);
  });

  test('passes through native attributes', async () => {
    const button = (await render(Button, {
      props: { type: 'submit', id: 'save', 'aria-label': 'Save changes' }
    })).querySelector('button')!;

    expect(button.getAttribute('type')).toBe('submit');
    expect(button.id).toBe('save');
    expect(button.getAttribute('aria-label')).toBe('Save changes');
  });

  test('stays a button when href is null', async () => {
    const root = await render(Button, { props: { href: null } });

    expect(root.querySelector('a')).toBeNull();
    expect(root.querySelector('button')).not.toBeNull();
  });

  describe('with href', () => {
    test('renders an anchor with the classes a button would get', async () => {
      const props = { variant: 'secondary', decoration: 'outline', size: 'icon', shape: 'circle', textVariant: 'colored' };
      const button = (await render(Button, { props })).querySelector('button')!;
      const root = await render(Button, { props: { ...props, href: '/boutique' }, slots: { default: 'Shop' } });
      const anchor = root.querySelector('a')!;

      expect(root.querySelector('button')).toBeNull();
      expect(anchor.getAttribute('href')).toBe('/boutique');
      expect(anchor.textContent.trim()).toBe('Shop');
      expect(anchor.classList.contains('button')).toBe(true);
      expect([...anchor.classList.values()].sort()).toEqual([...button.classList.values()].sort());
    });

    test('passes link and aria attributes through to the anchor', async () => {
      const anchor = (await render(Button, {
        props: {
          href: 'https://www.instagram.com/', target: '_blank', rel: 'noopener', hreflang: 'fr',
          referrerpolicy: 'no-referrer', download: 'heron.jpg', id: 'instagram', 'aria-label': 'Instagram'
        }
      })).querySelector('a')!;

      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toBe('noopener');
      expect(anchor.getAttribute('hreflang')).toBe('fr');
      expect(anchor.getAttribute('referrerpolicy')).toBe('no-referrer');
      expect(anchor.getAttribute('download')).toBe('heron.jpg');
      expect(anchor.id).toBe('instagram');
      expect(anchor.getAttribute('aria-label')).toBe('Instagram');
    });

    test.each([
      ['type', 'submit'],
      ['disabled', true],
      ['popovertarget', 'share'],
      ['popovertargetaction', 'show'],
      ['commandfor', 'order-dialog'],
      ['command', 'show-modal'],
      ['form', 'order'],
      ['formaction', '/order'],
      ['formmethod', 'post'],
      ['name', 'intent'],
      ['value', 'order']
    ])('fails when also given %s, which only works on a button', async (attribute, value) => {
      await expect(render(Button, { props: { href: '/boutique', [attribute]: value } })).rejects.toThrow(new RegExp(`\\b${attribute}\\b`));
    });

    test('accepts a button-only attribute that renders nothing', async () => {
      const anchor = (await render(Button, { props: { href: '/boutique', disabled: false, type: undefined } })).querySelector('a')!;

      expect(anchor.hasAttribute('disabled')).toBe(false);
    });

    test.each([
      ['a link', '<a href="/bio">Bio</a>'],
      ['a button', '<button>Buy</button>'],
      ['an input', '<input name="quantity">'],
      ['a focusable element', '<span tabindex="0">Focus me</span>']
    ])('fails when it contains %s', async (_, content) => {
      await expect(render(Button, { props: { href: '/boutique' }, slots: { default: content } })).rejects.toThrow(/interactive/);
    });

    test('accepts an icon in its slot', async () => {
      const anchor = (await render(Button, {
        props: { href: '/boutique', size: 'icon', 'aria-label': 'Shop' },
        slots: { default: '<svg aria-hidden="true"><path d="M0 0h1v1z"></path></svg>' }
      })).querySelector('a')!;

      expect(anchor.querySelector('svg')).not.toBeNull();
    });

    test('is described by a Tooltip it triggers', async () => {
      const container = await AstroContainer.create();
      const trigger = await container.renderToString(Button, {
        props: { href: 'https://www.instagram.com/', size: 'icon', shape: 'circle', 'aria-label': 'Instagram' }
      });
      const root = await render(Tooltip, { props: { text: 'Follow on Instagram', id: 'tip' }, slots: { default: trigger } });
      const anchor = root.querySelector('a')!;

      expect(anchor.getAttribute('aria-describedby')).toBe('tip');
      expect(anchor.getAttribute('aria-label')).toBe('Instagram');
    });
  });
});
