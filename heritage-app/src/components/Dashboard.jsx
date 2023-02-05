import {
  Button,
  Heading,
  Grid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  GridItem
} from "@chakra-ui/react";

export default function Dashboard({role, alive, timeAlive}) {
  return (
    <Grid
      templateColumns="repeat(3, 1fr)"
      padding="14px"
      spacing={10}
    >
      <GridItem colSpan="1" fontSize='xl' textAlign="left">
          <Heading marginLeft="28px">
            Contract Properties
          </Heading>
          <TableContainer padding="14px">
            <Table>
              <Tbody>
                <Tr>
                  <Td>Role</Td>
                  <Td>{role}</Td>
                </Tr>
                <Tr>
                  <Td>Alive left</Td>
                  <Td><Button fontSize='xl'>{alive} {alive == 1 ? "Day" : "Days"}</Button></Td>
                </Tr>
                <Tr>
                  <Td>Alive Interval</Td>
                  <Td>{timeAlive} {timeAlive == 1 ? "Day" : "Days"}</Td>
                </Tr>
                <Tr>
                  <Td># Heirs</Td>
                </Tr>
                <Tr>
                  <Td># Appointers</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
      </GridItem>
      <GridItem colSpan="2"  fontSize='xl' textAlign="left">
        <Heading>
          Send Ether
        </Heading>
      </GridItem>
    </Grid>
  )
}
