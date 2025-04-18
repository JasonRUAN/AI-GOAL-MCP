# SuiMCP

An [MCP server](https://modelcontextprotocol.io/) for the [Sui network](https://sui.io/) which can access data on the Sui network, and interface with your local Sui CLI.

## Usage

To get started, run the following init command to setup SuiMCP:

```bash
npx @jasonruan/sui-mcp@latest init

✔ Do you want to import your accounts from the Sui CLI? No
To use SuiMCP, you need to import an account. Enter a private key below, or leave empty to generate a new one
✔ Private Key **********************************************************************
Initialized SuiMCP with account 0xfbe1d8ae7a6ca3f94d670c57307376619696feb9b43069e55e53ae088b98ef8c
```

This will setup the Wallet that you'll use to interact with the chain. You can then configure your client with the following MCP configuration:

```json
{
  "mcpServers": {
    "suiMcp": {
      "command": "npx",
      "args": ["@jasonruan/sui-mcp@latest", "start"]
    }
  }
}
```

Here's the MCP documentation for popular clients:

- **[Cursor Guide](https://docs.cursor.com/context/model-context-protocol)**
- **[Claude Desktop Guide](https://modelcontextprotocol.io/quickstart/user)**

### Building Move

To build Move packages, you'll to have the Sui CLI installed and setup before you can use SuiMCP. You can follow the directions here: [Sui CLI](https://docs.sui.io/references/cli).

## Features

### Tools

- **get_default_address** - Get the default wallet address
- **list_addresses** - List all addresses available for the current wallet
- **set_default_address** - Set the default address of the wallet
- **get_balance** - Get the balance of a specific coin type for a wallet
- **get_all_balances** - Get all balances for a wallet
- **get_owned_coin_objects** - Get coin objects owned by a wallet, by coin type
- **get_object** - Get an object by its ID
- **get_owned_objects** - Get objects owned by a wallet
- **get_transaction** - Get a transaction by its ID
- **build_move_package** - Build a Sui Move package to bytecode
- **test_move_package** - Test a Sui Move package
- **publish_move_package** - Publish a Sui Move package to the Sui blockchain. This tool will also run Move build and Move test.
