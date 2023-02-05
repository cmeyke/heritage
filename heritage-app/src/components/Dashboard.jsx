import {
  Button,
  Heading,
  Grid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
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
                  <Td><Text>Role</Text></Td>
                  <Td><Text>{role}</Text></Td>
                </Tr>
                <Tr>
                  <Td><Text>Alive Interval</Text></Td>
                  <Td><Text>{timeAlive} {timeAlive === "1" ? "Day" : "Days"}</Text></Td>
                </Tr>
                <Tr>
                  <Td><Text>Alive left</Text></Td>
                  <Td><Button><Text fontSize='xl'>{alive} {alive === "1" ? "Day" : "Days"}</Text></Button></Td>
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
