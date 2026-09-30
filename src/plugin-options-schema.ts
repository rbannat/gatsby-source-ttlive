import type { GatsbyNode } from 'gatsby'

export const pluginOptionsSchema: GatsbyNode['pluginOptionsSchema'] = ({
  Joi,
}) =>
  Joi.object({
    associationId: Joi.number()
      .integer()
      .positive()
      .default(397)
      .description('TT-Live association (Verband) ID'),
  })
