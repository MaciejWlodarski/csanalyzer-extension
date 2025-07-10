import { z } from "zod";
import camelcaseKeys from "camelcase-keys";

const mapVetoEntitySchema = z
  .object({
    class_name: z.string(),
    game_map_id: z.string(),
    guid: z.string(),
    image_lg: z.string(),
    image_sm: z.string(),
    name: z.string(),
  })
  .transform((data) => {
    return camelcaseKeys(data, { deep: true });
  });
export type MapVetoEntity = z.infer<typeof mapVetoEntitySchema>;

const mapVetoSchema = z.object({
  entities: z.array(mapVetoEntitySchema),
  pick: z.array(z.string()),
});
export type MapVeto = z.infer<typeof mapVetoSchema>;

export const faceitMatchSchema = z.object({
  id: z.string(),
  demoURLs: z.array(z.string()),
  voting: z.object({
    map: mapVetoSchema,
  }),
});
export type FaceitMatch = z.infer<typeof faceitMatchSchema>;
