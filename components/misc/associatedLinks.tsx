import Link from "next/link"
import NotePreview from "./note-preview"

type Props = {
  backlinks: {
    [k: string]: {
      title: string
      excerpt: string
    }
  }
}

const AssociatedLinks = ({ backlinks }: Props) => {
  return (
    <>
      {Object.keys(backlinks).map((slug, idx) => {
        const post = backlinks[slug]
        return (
          <Link as={slug} href="[...slug]" prefetch={true} className="col-span-1" key={`backlinks-${idx}`}>
            <NotePreview title={post.title} content={post.excerpt} />
          </Link>
        )
      })}
    </>
  )
}

export default AssociatedLinks