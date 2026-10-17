import { describe, expect, test } from 'vitest';
import { render } from '../../../test/render';
import dusk from '../../assets/showcase/dusk.jpg';
import Avatar from './Avatar.astro';

const remote = 'https://example.com/people/kevin.jpg';

async function renderAvatar(props: Record<string, unknown>) {
  return (await render(Avatar, { props })).querySelector('.avatar')!;
}

describe('Avatar', () => {
  test('shows a remote image named after the person', async () => {
    const avatar = await renderAvatar({ src: remote, name: 'Kevin Verreault' });
    const img = avatar.querySelector('img')!;

    expect(img.getAttribute('src')).toBe(remote);
    expect(img.getAttribute('alt')).toBe('Kevin Verreault');
    expect(avatar.querySelector('.initials')).toBeNull();
  });

  test('shows a local image through Astro image optimisation', async () => {
    const img = (await renderAvatar({ src: dusk, name: 'Kevin Verreault' })).querySelector('img')!;

    expect(img.getAttribute('alt')).toBe('Kevin Verreault');
    expect(img.getAttribute('src')).toMatch(/_image|\.webp/);
  });

  test('lets alt override the name, e.g. empty for an avatar next to the name', async () => {
    const img = (await renderAvatar({ src: remote, name: 'Kevin Verreault', alt: '' })).querySelector('img')!;

    expect(img.getAttribute('alt')).toBe('');
  });

  test.each([
    ['Kevin Verreault', 'KV'],
    ['Cher', 'C'],
    ['jean-luc de la Tour', 'JT'],
    ['  Élodie   Ménard ', 'ÉM']
  ])('falls back to initials when there is no image: %s → %s', async (name, initials) => {
    const avatar = await renderAvatar({ name });

    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.querySelector('.initials')?.textContent.trim()).toBe(initials);
  });

  test('exposes the initials fallback as an image named after the person', async () => {
    const avatar = await renderAvatar({ name: 'Kevin Verreault' });

    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Kevin Verreault');
    expect(avatar.querySelector('.initials')?.getAttribute('aria-hidden')).toBe('true');
  });

  test('hides a decorative initials fallback from assistive technology', async () => {
    const avatar = await renderAvatar({ name: 'Kevin Verreault', alt: '' });

    expect(avatar.hasAttribute('role')).toBe(false);
    expect(avatar.hasAttribute('aria-label')).toBe(false);
  });

  test('is medium by default and takes a size', async () => {
    expect((await renderAvatar({ name: 'K V' })).classList.contains('size-medium')).toBe(true);
    expect((await renderAvatar({ name: 'K V', size: 'large' })).classList.contains('size-large')).toBe(true);
  });

  test('fails without a name', async () => {
    await expect(renderAvatar({ src: remote, name: '  ' })).rejects.toThrow(/name/);
  });

  test('passes through native attributes', async () => {
    const avatar = await renderAvatar({ name: 'Kevin Verreault', id: 'author', class: 'ring' });

    expect(avatar.id).toBe('author');
    expect(avatar.classList.contains('ring')).toBe(true);
  });
});
