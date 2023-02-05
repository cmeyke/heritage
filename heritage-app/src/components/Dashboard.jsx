import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr
} from "@chakra-ui/react";

export default function Dashboard({role, alive, timeAlive}) {
  return (
    <SimpleGrid
      minChildWidth="400px"
      padding="14px"
      spacing={10}
    >
      <Box w="400px" fontSize='xl'>
        <Heading>
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
      </Box>
      <Box w="400px" fontSize='xl'>
        <Heading>
          Send Ether
        </Heading>
      </Box>
    </SimpleGrid>
  )
}
