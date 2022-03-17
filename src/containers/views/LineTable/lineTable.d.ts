export interface ILineTableProps {
  mappingId: string
  handleConfigChange: () => void
  isEdit?: boolean
}

export interface ILineTableState {
  mapListVisible: boolean
  originStruct: any[]
  targetStruct: any[]
  mapDataType: string
  currentLink: {
    startKey: string
    endKey: string
  }
}

export interface IStruct {
  originStruct: any[]
  targetStruct: any[]
}

export interface IMappingIndex extends IStruct {
  mappingIndex: any[]
}

export interface IMapping {
  originStruct: any[]
  targetStruct: any[]
  mapping: any[]
}
