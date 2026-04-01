/**
 * Entity IO types — interfaces for custom entity definitions and instances.
 * Used by LocalEntityIO (fs), TursoEntityIO (DB), and factory.
 */

export interface EntityFieldDef {
  name: string
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'date' | 'array'
  label: string
  required?: boolean
  options?: string[]
}

export interface EntityPublicConfig {
  enabled: boolean
  path: string
  listTitle?: string
  detailTitleField?: string
  listFields?: string[]
  description?: string
}

export interface EntityDefinition {
  name: string
  label: string
  description?: string
  fields: EntityFieldDef[]
  public?: EntityPublicConfig
}

export interface EntityInstance {
  slug: string
  [key: string]: unknown
}

export interface EntityIO {
  listDefinitions(): Promise<EntityDefinition[]>
  getDefinition(name: string): Promise<EntityDefinition | null>
  writeDefinition(name: string, def: Omit<EntityDefinition, 'name'>): Promise<void>
  deleteDefinition(name: string): Promise<boolean>
  listPublicDefinitions(): Promise<EntityDefinition[]>
  getPublicConfig(name: string): Promise<EntityPublicConfig | null>
  listInstances(entityName: string): Promise<EntityInstance[]>
  readInstance(entityName: string, slug: string): Promise<EntityInstance | null>
  writeInstance(entityName: string, slug: string, data: Record<string, unknown>): Promise<void>
  deleteInstance(entityName: string, slug: string): Promise<boolean>
}
