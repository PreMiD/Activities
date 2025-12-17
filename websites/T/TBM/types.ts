export interface Root {
  modes: ModeCategory[]
}

export interface ModeCategory {
  mode: TransportModeType
  name: string
  lines: TransportLine[]
}

export type TransportModeType
  = | 'TRAMWAY'
    | 'BUS'
    | 'FERRY'
    | 'SCHOOL_BUS'
    | 'TRAIN'
    | 'REGIONAL_BUS'
    | string

export interface TransportLine {
  id: string
  code: string
  name: string
  mode: TransportModeType
  iconUrl: string | null
  isOperating: boolean
  isSpecial: boolean
  style: LineStyle
}

export interface LineStyle {
  color: string
  textColor: string
}

export interface LineDetails {
  name: string
  iconUrl: string | null
}
