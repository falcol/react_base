import { Table, TablePaginationConfig, Select, Pagination, TableProps } from 'antd'
import { ColumnsType } from 'antd/es/table'

interface DataTableAntdProps<T>
  extends Omit<
    TableProps<T>,
    'columns' | 'dataSource' | 'loading' | 'pagination' | 'scroll' | 'rowKey'
  > {
  columns: ColumnsType<T>
  dataSource: T[]
  loading: boolean
  pagination: TablePaginationConfig
  onPaginationChange: (pagination: TablePaginationConfig) => void
  rowKey: string
  pageSizeOptions?: number[]
  scrollX?: string | number
  scrollY?: string | number
}

const DataTableAntd = <T extends object>({
  columns,
  dataSource,
  loading,
  pagination,
  onPaginationChange,
  rowKey,
  pageSizeOptions = [20, 50, 100],
  scrollX = 'max-content',
  scrollY = 300,
  ...restProps
}: DataTableAntdProps<T>) => {
  return (
    <div className="table-responsive">
      {/* Table */}
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={false}
        scroll={{ x: scrollX, y: scrollY }}
        {...restProps}
      />

      {/* Pagination */}
      <div
        style={{
          display: dataSource.length > 0 ? 'flex' : 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          画面行数
          <Select
            value={pagination.pageSize}
            onChange={(value) =>
              onPaginationChange({
                ...pagination,
                pageSize: value,
                current: 1,
              })
            }
            style={{ width: 80 }}
          >
            {pageSizeOptions.map((size) => (
              <Select.Option key={size} value={size}>
                {size}
              </Select.Option>
            ))}
          </Select>
          <span>
            {pagination.total}件中
            {pagination.total
              ? `${(pagination.current! - 1) * pagination.pageSize! + 1}〜${Math.min(
                  (pagination.current! - 1) * pagination.pageSize! + dataSource.length,
                  pagination.total,
                )}件目を表示`
              : ''}
          </span>
        </div>

        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showSizeChanger={false}
          onChange={(page) =>
            onPaginationChange({
              ...pagination,
              current: page,
            })
          }
        />
      </div>
    </div>
  )
}

export default DataTableAntd
