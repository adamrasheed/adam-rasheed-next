import {defineType, defineArrayMember, defineField} from 'sanity'
import {CodeIcon, ImageIcon, ImagesIcon, ThListIcon, PlayIcon} from '@sanity/icons'

// Shared by inline images and gallery photos so both carry the same alt and
// caption fields.
const photoFields = [
  defineField({
    name: 'alt',
    type: 'string',
    title: 'Alternative Text',
    description: 'Describe the photo for screen readers.',
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: 'caption',
    type: 'string',
    title: 'Caption',
  }),
]

/**
 * Rich text body shared by posts, pages, and the about page. Reuse it with
 * `{name: 'body', type: 'blockContent'}`.
 */
export const blockContentType = defineType({
  title: 'Block Content',
  name: 'blockContent',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'H1', value: 'h1'},
        {title: 'H2', value: 'h2'},
        {title: 'H3', value: 'h3'},
        {title: 'H4', value: 'h4'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
        ],
        annotations: [
          {
            title: 'URL',
            name: 'link',
            type: 'object',
            fields: [
              {
                title: 'URL',
                name: 'href',
                type: 'url',
                validation: (Rule) =>
                  Rule.required().uri({allowRelative: true, scheme: ['http', 'https', 'mailto']}),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      icon: ImageIcon,
      options: {hotspot: true},
      fields: photoFields,
    }),
    defineArrayMember({
      name: 'gallery',
      title: 'Photo gallery',
      type: 'object',
      icon: ImagesIcon,
      fields: [
        defineField({
          name: 'images',
          type: 'array',
          of: [defineArrayMember({type: 'image', options: {hotspot: true}, fields: photoFields})],
          options: {layout: 'grid'},
          validation: (Rule) => Rule.required().min(2),
        }),
        defineField({
          name: 'perRow',
          title: 'Photos per row',
          description: 'Photos in a row share one height, so mixed portrait and landscape shots line up.',
          type: 'number',
          options: {list: [1, 2, 3, 4], layout: 'radio', direction: 'horizontal'},
          initialValue: 2,
        }),
        defineField({
          name: 'caption',
          title: 'Gallery caption',
          type: 'string',
        }),
      ],
      preview: {
        select: {images: 'images', caption: 'caption', media: 'images.0'},
        prepare: ({images, caption, media}) => ({
          title: caption || 'Photo gallery',
          subtitle: `${images?.length ?? 0} photos`,
          media,
        }),
      },
    }),
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code',
      type: 'object',
      icon: CodeIcon,
      fields: [
        defineField({name: 'filename', type: 'string'}),
        defineField({
          name: 'language',
          type: 'string',
          options: {
            list: ['ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'css', 'html', 'liquid', 'graphql', 'swift', 'python', 'text'],
          },
        }),
        defineField({name: 'code', type: 'text', rows: 10, validation: (Rule) => Rule.required()}),
      ],
      preview: {
        select: {title: 'filename', subtitle: 'language', code: 'code'},
        prepare: ({title, subtitle, code}) => ({
          title: title || code?.split('\n')[0] || 'Code',
          subtitle,
        }),
      },
    }),
    defineArrayMember({
      name: 'table',
      type: 'object',
      icon: ThListIcon,
      fields: [
        defineField({
          name: 'rows',
          type: 'array',
          of: [
            defineArrayMember({
              name: 'row',
              type: 'object',
              fields: [defineField({name: 'cells', type: 'array', of: [{type: 'string'}]})],
              preview: {
                select: {cells: 'cells'},
                prepare: ({cells}) => ({title: (cells ?? []).join(' | ')}),
              },
            }),
          ],
          validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
          name: 'hasHeader',
          title: 'First row is a header',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({name: 'caption', type: 'string'}),
      ],
      preview: {
        select: {caption: 'caption', rows: 'rows'},
        prepare: ({caption, rows}) => ({
          title: caption || 'Table',
          subtitle: `${rows?.length ?? 0} rows`,
        }),
      },
    }),
    defineArrayMember({
      name: 'embed',
      title: 'Video embed',
      type: 'object',
      icon: PlayIcon,
      fields: [
        defineField({
          name: 'url',
          title: 'YouTube or Vimeo URL',
          type: 'url',
          validation: (Rule) => Rule.required(),
        }),
        defineField({name: 'caption', type: 'string'}),
      ],
      preview: {select: {title: 'caption', subtitle: 'url'}},
    }),
  ],
})
