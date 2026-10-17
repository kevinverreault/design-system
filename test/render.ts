import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parse, type HTMLElement } from 'node-html-parser';

type Component = Parameters<AstroContainer['renderToString']>[0];

interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
}

/** Renders an Astro component through the Container API and returns the parsed HTML. */
export async function render(component: Component, { props = {}, slots = {} }: RenderOptions = {}): Promise<HTMLElement> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(component, { props, slots });

  return parse(html);
}
