// Handcrafted by SonicGarden, it's non-offical
declare namespace cybozu {
  namespace data {
    namespace page {
      namespace FORM_DATA {
        const layout: Layout
        const schema: Schema
        const lookups: Lookup[]

        type Layout = (Row | Subtable)[]

        type Row = {
          id: null
          type: 'ROW'
          isSubtable: false
          var: null
          label: null
          controlList: (RowField | RowReferenceTable | RowLabel | RowHr | RowSpacer)[]
        }

        type Subtable = {
          id: string
          type: 'SUBTABLE'
          isSubtable: true
          var: string
          label: string
          controlList: RowField[]
        }

        type RowField = {
          isVirtical: true
          type:
            | 'RECORD_NUMBER'
            | 'CREATOR'
            | 'CREATED_TIME'
            | 'MODIFIER'
            | 'UPDATED_TIME'
            | 'SINGLE_LINE_TEXT'
            | 'NUMBER'
            | 'CALC'
            | 'MULTI_LINE_TEXT'
            | 'RICH_TEXT'
            | 'CHECK_BOX'
            | 'RADIO_BUTTON'
            | 'DROP_DOWN'
            | 'MULTI_SELECT'
            | 'FILE'
            | 'LINK'
            | 'DATE'
            | 'TIME'
            | 'DATETIME'
            | 'USER_SELECT'
            | 'ORGANIZATION_SELECT'
            | 'GROUP_SELECT'
          styleMap: {
            width: number
          }
          var: string
          label: string
        }

        type RowReferenceTable = {
          isVirtical: true
          type: 'REFERENCE_TABLE'
          // eslint-disable-next-line
          styleMap: {}
          var: string
          label: string
        }

        type RowLabel = {
          type: 'LABEL'
          formatted: string
        }

        type RowHr = {
          type: 'HR'
        }

        type RowSpacer = {
          elementId: string
          styleMap: {
            width: number
            height: number
          }
          type: 'SPACER'
        }

        type FieldMapping = {
          fieldId: string
          targetFieldId: string
        }

        type LookupCondition = LookupConditionComparision | LookupConditionIn
        type LookupConditionComparision = {
          key: string
          nest: number
          op: 'LIKE' | 'NOT_LIKE' | 'EQ' | 'NE' | 'LE' | 'LT' | 'GE' | 'GT' | 'IN' | 'NOT_IN'
          type: 'COMPARISION'
          value: {
            args: { type: string; value: string }[] | null
            type: 'STRING' | 'FUNCTION'
            value: string
          }
        }

        type LookupConditionIn = {
          key: string
          nest: number
          op: 'IN'
          type: 'IN'
          values: {
            args: null
            type: 'STRING'
            value: string
          }[]
        }
        type Schema = {
          table: {
            fieldList: FieldList
            id: string
            label: string
            var: string
          }
          subTable: {
            [x: string]: {
              fieldList: FieldList
              id: string
              label: string
              var: string
            }
          }
        }

        type Field = {
          id: string
          type: string
          var: string
          label: string
          properties: {
            options: { id: string; label: string }[]
          }
        }

        type FieldList = {
          [x: string]: Field
        }

        type Lookup = {
          id: string
          fieldMappings: FieldMapping[]
          keyMapping: FieldMapping
          keyTargetFieldAccessible: boolean
          listFields: string[]
          query: {
            condition: {
              children: LookupCondition[]
              op: 'AND' | 'OR'
              type: string
              nest: number
            }
            limit: string
            offset: string
            orders: { name: string; op: 'ASC' | 'DESC' }[]
          }
          targetApp: {
            id: string
            schema: {
              table: {
                fieldList: FieldList
              }
            }
          }
          unAccessibleFieldIds: string[]
        }
      }
    }
  }
}
