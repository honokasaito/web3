import * as React from 'react';
import { ZeroEx, SignedOrder } from '0x.js';
import { relayerResponseJsonParsers } from '@0xproject/connect/lib/src/utils/relayer_response_json_parsers';

interface Props {
    zeroEx: ZeroEx;
}

export default class Faucet extends React.Component<Props, {}> {
    constructor(props: Props) {
        super(props);
    }
    private async dispenseZRX(): Promise<void> {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const url = `https://faucet.0xproject.com/zrx/${address}`;
        await fetch(url);
    }
    private async dispenseETH(): Promise<void> {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const url = `https://faucet.0xproject.com/ether/${address}`;
        await fetch(url);
    }
    private async orderWETH(): Promise<void> {
        const addresses = await this.props.zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const url = `https://faucet.0xproject.com/order/weth/${address}`;
        const response = await fetch(url);
        const bodyJson = await response.json();

        const signedOrder: SignedOrder = relayerResponseJsonParsers.parseOrderJson(bodyJson);
        console.log(signedOrder);

        const fillAmount = ZeroEx.toBaseUnitAmount(signedOrder.takerTokenAmount, 18);
        try {
            await this.props.zeroEx.exchange.fillOrderAsync(signedOrder, fillAmount, true, address);
        } catch (e) {
            console.log(e);
        }
    }
    private async setZRXAllowance(): Promise<void> {
        const { zeroEx } = this.props;
        const addresses = await zeroEx.getAvailableAddressesAsync();
        const address = addresses[0];
        const zrxTokenAddress = '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570';
        const allowance = await zeroEx.token.getProxyAllowanceAsync(zrxTokenAddress, address);
        if (!allowance.gte(0)) {
            // await zeroEx.token.setUnlimitedProxyAllowanceAsync(zrxTokenAddress, address);
            console.log('Setting Allowance');
        } else {
            console.log('Allowance for ZRX already set', allowance.toString());
        }
    }
    render() {
        return (
            <div>
                <h2> Testnet Faucets </h2>
                <p>
                    {' '}
                    Faucets will dispense ETH and ZRX tokens to your account on the test network. This will allow you to
                    begin exchanging ERC20 tokens.
                </p>
                <button id="dispenseETH" onClick={this.dispenseETH.bind(this)}>
                    Dispense ETH
                </button>
                <button id="dispenseZRX" onClick={this.dispenseZRX.bind(this)}>
                    Dispense ZRX
                </button>
                <p>
                    0x.js is for exchange, to perform an exchange of ZRX for WETH click the button below.
                    <br />This will generate an order from our Faucet (who will be the maker) and you will submit the
                    order to the blockchain (and therefor be the taker).
                    <br />After the transaction confirms on the blockchain, you should notice a change in your balance
                    of WETH (+0.1) and ZRX (-0.1) <br />For 0x to make an exchange on your behalf, you must first Allow
                    the 0x exchange contract for each ERC20 Token. Allowance settings can be found on the{' '}
                    <a href="https://0xproject.com/portal/balances">Portal</a>.
                </p>
                <button id="setZRXAllowance" onClick={this.setZRXAllowance.bind(this)}>
                    Set ZRX Allowance
                </button>
                <button id="orderWETH" onClick={this.orderWETH.bind(this)}>
                    Exchange ZRX/WETH
                </button>
            </div>
        );
    }
}
