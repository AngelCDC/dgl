'use client'

export default function ArticuloContent({ content }) {
  if (!content || !Array.isArray(content)) return null
  return (
    <div style={{ fontFamily: 'var(--font-inter)', fontSize: '16px', lineHeight: '1.75', color: 'var(--ink)' }}>
      {content.map((block, i) => <Block key={i} block={block} />)}
    </div>
  )
}

function Block({ block }) {
  switch (block.type) {
    case 'paragraph':
      if (!block.content?.length && !block.children?.length) return <div style={{ marginBottom: '0.8em' }} />
      return (
        <p style={{ marginBottom: '1.2em' }}>
          <InlineContent content={block.content} />
        </p>
      )

    case 'heading': {
      const level = block.props?.level ?? 2
      const sizes = { 1: '28px', 2: '22px', 3: '18px' }
      return (
        <div style={{ borderTop: '3px solid var(--accent)', paddingTop: '0.6em', marginTop: '2em', marginBottom: '0.6em' }}>
          <span style={{ fontFamily: 'var(--font-dm)', fontWeight: '700', fontSize: sizes[level] ?? '20px', letterSpacing: '-0.01em', color: 'var(--ink)' }}>
            <InlineContent content={block.content} />
          </span>
          {block.children?.length > 0 && (
            <div style={{ marginTop: '0.6em' }}>
              {block.children.map((child, i) => <Block key={i} block={child} />)}
            </div>
          )}
        </div>
      )
    }

    case 'bulletListItem':
      return (
        <div style={{ marginBottom: '0.4em', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ color: 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>·</span>
            <span><InlineContent content={block.content} /></span>
          </div>
          {block.children?.length > 0 && (
            <div style={{ paddingLeft: '20px', marginTop: '4px' }}>
              {block.children.map((child, i) => <Block key={i} block={child} />)}
            </div>
          )}
        </div>
      )

    case 'numberedListItem':
      return (
        <div style={{ marginBottom: '0.4em', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)', flexShrink: 0, minWidth: '20px' }}>–</span>
            <span><InlineContent content={block.content} /></span>
          </div>
          {block.children?.length > 0 && (
            <div style={{ paddingLeft: '20px', marginTop: '4px' }}>
              {block.children.map((child, i) => <Block key={i} block={child} />)}
            </div>
          )}
        </div>
      )

    case 'checkListItem':
      return (
        <div style={{ marginBottom: '0.4em', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>
              {block.props?.checked ? '☑' : '☐'}
            </span>
            <span style={{ color: block.props?.checked ? 'var(--steel)' : 'var(--ink)', textDecoration: block.props?.checked ? 'line-through' : 'none' }}>
              <InlineContent content={block.content} />
            </span>
          </div>
          {block.children?.length > 0 && (
            <div style={{ paddingLeft: '24px', marginTop: '4px' }}>
              {block.children.map((child, i) => <Block key={i} block={child} />)}
            </div>
          )}
        </div>
      )

    case 'toggleListItem':
      return (
        <div style={{ marginBottom: '0.5em', paddingLeft: '8px' }}>
          <div style={{ fontWeight: '600', color: 'var(--ink)', marginBottom: '6px', display: 'flex', gap: '8px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '12px', marginTop: '3px' }}>▶</span>
            <InlineContent content={block.content} />
          </div>
          {block.children?.length > 0 && (
            <div style={{ paddingLeft: '20px', borderLeft: '2px solid var(--border)', marginLeft: '6px' }}>
              {block.children.map((child, i) => <Block key={i} block={child} />)}
            </div>
          )}
        </div>
      )

    case 'quote':
      return (
        <blockquote style={{ background: 'var(--navy)', borderLeft: '4px solid var(--accent)', padding: '20px 28px', margin: '2em 0', borderRadius: '0 2px 2px 0' }}>
          <span style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic', fontSize: '17px', lineHeight: '1.7', color: 'rgba(255,255,255,0.85)' }}>
            <InlineContent content={block.content} />
          </span>
        </blockquote>
      )

    case 'codeBlock':
      return (
        <pre style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: '4px solid var(--accent)', padding: '16px 20px', overflowX: 'auto', margin: '1.5em 0' }}>
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ink)' }}>
            <InlineContent content={block.content} />
          </code>
        </pre>
      )

    case 'image':
      return block.props?.url ? (
        <figure style={{ margin: '2em 0' }}>
          <img src={block.props.url} alt={block.props.caption ?? ''} style={{ width: '100%', display: 'block', border: '1px solid var(--border)' }} />
          {block.props.caption && (
            <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--steel)', marginTop: '8px' }}>
              {block.props.caption}
            </figcaption>
          )}
        </figure>
      ) : null

    case 'table': {
      const rows = block.content?.rows ?? []
      if (rows.length === 0) return null
      return (
        <div style={{ overflowX: 'auto', margin: '1.5em 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-inter)', fontSize: '14px' }}>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ background: i === 0 ? 'var(--bg)' : i % 2 === 0 ? '#fafbfc' : '#fff' }}>
                  {row.cells?.map((cell, j) => {
                    const Tag = i === 0 ? 'th' : 'td'
                    const cellContent = Array.isArray(cell) ? cell : cell?.content ?? []
                    return (
                      <Tag key={j} style={{ border: '1px solid var(--border)', padding: '10px 14px', textAlign: 'left', fontWeight: i === 0 ? '600' : '400', color: 'var(--ink)', fontFamily: i === 0 ? 'var(--font-dm)' : 'var(--font-inter)' }}>
                        <InlineContent content={cellContent} />
                      </Tag>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2em 0' }} />

    default:
      if (block.content?.length > 0) {
        return (
          <div style={{ marginBottom: '0.8em' }}>
            <InlineContent content={block.content} />
            {block.children?.length > 0 && (
              <div style={{ paddingLeft: '20px', marginTop: '4px' }}>
                {block.children.map((child, i) => <Block key={i} block={child} />)}
              </div>
            )}
          </div>
        )
      }
      return null
  }
}

function InlineContent({ content }) {
  if (!content || !Array.isArray(content)) return null
  return (
    <>
      {content.map((item, i) => {
        if (item.type === 'text') {
          const s = item.styles ?? {}
          let el = <>{item.text}</>
          if (s.code) el = <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', background: 'var(--bg)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '2px' }}>{item.text}</code>
          if (s.bold) el = <strong>{el}</strong>
          if (s.italic) el = <em>{el}</em>
          if (s.underline) el = <u>{el}</u>
          if (s.strike) el = <s>{el}</s>
          if (s.textColor && s.textColor !== 'default') el = <span style={{ color: s.textColor }}>{el}</span>
          return <span key={i}>{el}</span>
        }
        if (item.type === 'link') {
          return (
            <a key={i} href={item.href} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--accent)', borderBottom: '1px solid currentColor' }}>
              <InlineContent content={item.content} />
            </a>
          )
        }
        if (item.type === 'mention') {
          return <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--corp)' }}>@{item.props?.user}</span>
        }
        return null
      })}
    </>
  )
}