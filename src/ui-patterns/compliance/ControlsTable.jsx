import React from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableToolbar,
  TableHeader,
  TableBody,
  TableToolbarContent,
  TableCell,
  TableToolbarSearch,
  OverflowMenu,
  OverflowMenuItem,
  Tag
} from 'carbon-components-react';
import {
  Link
} from "react-router-dom";

const ControlsTable = ({ rows, headers }) => (
  <DataTable rows={rows} headers={headers}>
    {({
      rows,
      headers,
      getHeaderProps,
      getRowProps,
      getTableProps,
      getToolbarProps,
      onInputChange,
      getTableContainerProps,
    }) => (
      <TableContainer
        {...getTableContainerProps()}>
        <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
          <TableToolbarContent>
            <TableToolbarSearch onChange={onInputChange} />
          </TableToolbarContent>
        </TableToolbar>
        <Table {...getTableProps()}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader key={header.key} {...getHeaderProps({ header })}>
                  {header.header}
                </TableHeader>
              ))}
              <TableHeader></TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} {...getRowProps({ row })}>
                {row.cells.map((cell) => (
                  <TableCell key={cell.id}>
                    {
                      cell.info && cell.info.header === "id" ?
                        <Tag type="blue">
                          <Link to={"/controls/" + cell.value.toLowerCase().replace(' ', '_')} >
                            {cell.value}
                          </Link>
                        </Tag>
                      :
                        cell.value
                    }
                  </TableCell>
                ))}
                <TableCell>
                  
                  <OverflowMenu light flipped style={{flex:1}}>
                    <Link class="bx--overflow-menu-options__option" to={"/controls/" + row.id.toLowerCase().replace(' ', '_')}>
                      <OverflowMenuItem itemText="Details" />
                    </Link>
                  </OverflowMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DataTable>
);

export default ControlsTable;
