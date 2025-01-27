import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeRewrite from 'rehype-rewrite';
import rehypeStringify from 'rehype-stringify'
import { getLinksMapping, getPostBySlug, getSlugFromHref, updateMarkdownLinks } from './api'
import removeMd from 'remove-markdown'
import { renderToStaticMarkup } from "react-dom/server"
import NotePreview from '../components/misc/note-preview'
import { fromHtml } from 'hast-util-from-html'
import { Element } from 'hast-util-select/lib'
import Link from 'next/link'


export async function markdownToHtml(markdown: string, currSlug: string) {
  markdown = updateMarkdownLinks(markdown, currSlug);

  // get mapping of current links
  const links = (getLinksMapping())[currSlug] as string[]
  const linkNodeMapping = new Map<string, Element>();
  for (const l of links) {
    const post = getPostBySlug(l, ['title', 'content']);
    const node = createNoteNode(post.title, post.content, currSlug)
    linkNodeMapping[l] = node
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeRewrite, {
      selector: 'a',
      rewrite: async (node) => rewriteLinkNodes(node, linkNodeMapping, currSlug)
    })
    .use(rehypeStringify)
    .process(markdown)
  let htmlStr = file.toString()
  return htmlStr;
}

export function getMDExcerpt(markdown: string, length: number = 500) {
  const text = removeMd(markdown, {
    stripListLeaders: false, 
    gfm: true,
    useImgAltText: true,
  }) as string
  return text.slice(0, length).trim();
}

export function createNoteNode(title: string, content: string, slug: string) {
  const mdContentStr = getMDExcerpt(content);
  const htmlStr = renderToStaticMarkup(NotePreview({ title, content: mdContentStr }))
  const noteNode = fromHtml(htmlStr);
  return noteNode;
}

const generateLink = ({ href, children}: { href: string, children: any }) => {
  console.log("Generating Link to ", href)
  return <Link href={href} prefetch={true} >{...children}</Link>
}

function rewriteLinkNodes (node, linkNodeMapping: Map<string, any>, currSlug) {
  if (node.type === 'element' && node.tagName === 'a') {
    // const slug = getSlugFromHref(currSlug, node.properties.href)
    node = generateLink({ href: node.properties.href, children: node.children })

    // const noteCardNode = linkNodeMapping[slug]
    // if (noteCardNode) {
    //   const anchorNode = {...node}
    //   anchorNode.properties.className = 'internal-link prefetch-trigger'
    //   anchorNode.properties['-dataslug'] = slug;  // Add slug as data attribute

    //   node.tagName = 'span'
    //   node.properties = { className: 'internal-link-container prefetch-trigger' }
    //   node.children = [
    //     anchorNode,
    //     noteCardNode
    //   ]
    // }
  }
}
