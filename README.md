# SuiMCP

An [MCP server](https://modelcontextprotocol.io/) for the [Sui network](https://sui.io/) which can access data on the Sui network, and interface with your local Sui CLI.

## Usage

You'll need to have the Sui CLI installed and setup before you can use SuiMCP. You can follow the directions here: [Sui CLI](https://docs.sui.io/references/cli).

You can configure your client with the following

```json
{
  "mcpServers": {
    "suiMcp": {
      "command": "npx",
      "args": ["@jordangens/sui-mcp", "start"]
    }
  }
}
```

Here's the documentation for popular clients:

- **[Cursor Guide](https://docs.cursor.com/context/model-context-protocol)**
- **[Claude Desktop Guide](https://modelcontextprotocol.io/quickstart/user)**

## Features

### Tools

- **current_address** - Get the current wallet address
- **list_addresses** - List all addresses for the current wallet
- **switch_address** - Switch to a different address
- **set_current_network** - Set the current Sui network
- **get_current_network** - Get the current Sui network
- **list_networks** - List all available Sui networks
- **get_balance** - Get the balance of a specific coin type for a wallet
- **get_all_balances** - Get all balances for a wallet
- **get_owned_coin_objects** - Get coin objects owned by a wallet, by coin type
- **get_object** - Get an object by its ID
- **get_owned_objects** - Get objects owned by a wallet
- **get_transaction** - Get a transaction by its ID
- **build_move_package** - Build a Sui Move package to bytecode
- **test_move_package** - Test a Sui Move package
- **publish_move_package** - Publish a Sui Move package to the Sui blockchain. This tool will also build the package.
