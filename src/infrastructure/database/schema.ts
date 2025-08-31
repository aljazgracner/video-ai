import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	jsonb,
} from 'drizzle-orm/pg-core';

export const videos = pgTable('videos', {
	id: uuid('id').primaryKey().defaultRandom(),
	youtubeUrl: text('youtube_url').notNull(),
	title: text('title').notNull(),
	duration: integer('duration').notNull(),
	thumbnailUrl: text('thumbnail_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transcripts = pgTable('transcripts', {
	id: uuid('id').primaryKey().defaultRandom(),
	videoId: uuid('video_id')
		.notNull()
		.references(() => videos.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	logicalSegments: jsonb('logical_segments'),
	inputTokens: integer('input_tokens').default(0),
	outputTokens: integer('output_tokens').default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;
