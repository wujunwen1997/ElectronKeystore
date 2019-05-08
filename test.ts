import * as assert from 'assert';

const bcrypto = require('blockchain-crypto');

describe('mnemonic', function () {
    describe('128bit random for 12 mnemonic works', function () {
        let random = bcrypto.random(128); // random is ArrayBuffer
        assert.equal(random.byteLength, 16, 'random should be 16 bytes ArrayBuffer');

        let mnemonic = bcrypto.create_mnemonic(random); // mnemonic is Array of string
        assert.equal(mnemonic.length, 12, 'mnemonic should be 12 Array of string');
    });

    describe('mnemonic to seed', function () {
        let mnemonic = 'drum uniform toddler drink marriage position illegal bulk shrimp fresh school pave';
        let passphrase = '';
        let seed = bcrypto.to_hex(bcrypto.mnemonic_toseed(mnemonic, passphrase));
        assert.equal(seed, '8543019eed9c4480e16fc399e3c82109bb7e3d3facf32d4dd9a22f7ddf3626463683f257ec84d2c9898c1f0475f2abb7c2edf3b4afc944c92c8ccdde6c231723');

        passphrase = '123456';
        seed = bcrypto.to_hex(bcrypto.mnemonic_toseed(mnemonic, passphrase));
        assert.equal(seed, 'f7dc7f25dfa33fccc3954c69e4e41f546133c24c88677a12def9979210de810fe11a264e556cf2429e981dbfbff685cfe40fa6ecc4fcbd8050e4b967a4dd53dd');

        mnemonic = 'filter proud glass culture defense dice input amateur chief current keen library nuclear develop group garment mountain step';
        passphrase = '123456';
        seed = bcrypto.to_hex(bcrypto.mnemonic_toseed(mnemonic, passphrase));
        assert.equal(seed, '2dbc066ad4b60535e072e8059d345f2c63338b5ad5b0267d4d16a9f8413e866f619893e4840abdd7d91eedac8fdd8a199473cf641626969f8eac8aca67d3c61c');
    });
});

describe('BTC', function () {

    describe('hd', function () {
        describe('create hd from mnemonic', function () {
            let mnemonic = 'drum uniform toddler drink marriage position illegal bulk shrimp fresh school pave';
            let passphrase = '123456';
            let seed = bcrypto.mnemonic_toseed(mnemonic, passphrase);
            let rootPrivateKey = bcrypto.btc_Key.from_seed(seed);
            let first_derive = rootPrivateKey.derive(0x80000000 + 44).derive(0x80000000).derive(0x80000000).derive(0).derive(1);
            let address = bcrypto.btc_PublicKey.to_address(first_derive.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));
            assert.equal(address, '1Aujvz88gmgmmrRmWVKqpfiHJaTawggt5A');
        });
    });

    describe('rawkey', function () {
        describe('create raw key', function () {
            const rawkeybytes = bcrypto.from_hex('fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');

            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes, true);

            assert.equal(key.is_valid(), true);

            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '1QKTtag1zQgwhRAKijEy3jFMGPGQr1pMA2');

            assert.equal(bcrypto.to_hex(key.get_raw()), 'fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
        })

        describe('get key raw content', function () {
            const rawkeybytes = bcrypto.from_hex('fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes, true);

            assert.equal(key.is_valid(), true);

            assert.equal(bcrypto.to_hex(key.get_raw()), 'fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
        })

        describe('decode wif', function () {
            const key = bcrypto.btc.decode_key('L3FxrmV1qtA6FAFrqqMfMAX4D4z5JKq5TVmTmrdcZuagT3uMy8JP')

            assert.equal(key.is_valid(), true);

            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '1BC8TKNDPBW42SSrGD6mpFuWmHPEwhrbbD');
        })
        describe('decode wif 2', function () {
            const key = bcrypto.btc.decode_key('5KetyspvqqbGzxm9dw8bGLfw39cWFUpQJHm5kX1mMsh3AAwnnBm')
            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '13GBgBBnHitW27SyW1MQbfL9t5Dex8dABP');
        })
    });

    describe('btc_base58', function () {
        describe('base decode', function () {
            const rawkeybytes = bcrypto.btc.base58_decode_checked('L3FxrmV1qtA6FAFrqqMfMAX4D4z5JKq5TVmTmrdcZuagT3uMy8JP');

            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes.slice(1, 33), true);
            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '1BC8TKNDPBW42SSrGD6mpFuWmHPEwhrbbD');
        })

        describe('base encode', function () {
            const rawkeybytes = bcrypto.from_hex('80b42ef4028c1119fa408e714bfdf8692e1232ed6c4d93813adf2259a79b9d343601');
            const wif = bcrypto.btc.base58_encode_checked(rawkeybytes);
            assert.equal(wif, 'L3FxrmV1qtA6FAFrqqMfMAX4D4z5JKq5TVmTmrdcZuagT3uMy8JP');
        })
    });

    describe('chainparams', function () {
        describe('get chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const PUBKEY_ADDRESS_PREFIX = main_net_params.get_base58_prefix(bcrypto.PUBKEY_ADDRESS);
            assert.equal(bcrypto.to_hex(PUBKEY_ADDRESS_PREFIX), '00');
            assert.equal(main_net_params.get_bech32_hrp(), 'bc');
        })

        describe('decode address by chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const hash160 = bcrypto.btc.decode_address('1BC8TKNDPBW42SSrGD6mpFuWmHPEwhrbbD', main_net_params);
            assert.equal(hash160, '6fcc0e341821b180879ecd3e5f1f6d527c52d86b');
        })

        describe('decode witness address by chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const hash160 = bcrypto.btc.decode_address('bc1qdlxqudqcyxccppu7e5l978md2f799krtgr997f', main_net_params);
            assert.equal(hash160, '006fcc0e341821b180879ecd3e5f1f6d527c52d86b');
        })
    });



    describe('rawtransaction', function () {
        describe('createrawtransaction', function () {
            const rawtx = bcrypto.btc.create_rawtransaction(
                [
                    { txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c", vout: 0 },
                    { txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c", vout: 1 }
                ],
                [
                    { address: "mhn8yEGm6kKkoDvbDaKnRaYUk4pMnzYeXw", amount: "0.1" },
                    { address: "mhn8yEGm6kKkoDvbDaKnRaYUk4pMnzYeXw", amount: "0.04863182" },
                ]);
            assert.equal(bcrypto.to_hex(rawtx), '02000000021c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70000000000ffffffff1c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70100000000ffffffff0280969800000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288acce344a00000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000');
        })

        describe('get_key_for_rawtransaction', function () {

            const key_id_list = bcrypto.btc.get_required_keyid_to_sign_tranaction_input(
                {
                    scriptpubkey: "76a91491b24bf9f5288532960ac687abb035127b1d28a588ac",
                    witnessScript: "",
                    redeemScript: "",
                }
            );
            assert.equal(1, same_array(key_id_list, ['a5281d7b1235b0ab87c60a96328528f5f94bb291']));
        })

        describe('sign_transaction', function () {

            const signed_tx = bcrypto.btc.sign_rawtransaction(
                bcrypto.from_hex('01000000011c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70100000000ffffffff02204e0000000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac46e74900000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000')
                , [bcrypto.btc.decode_key('5KetyspvqqbGzxm9dw8bGLfw39cWFUpQJHm5kX1mMsh3AAwnnBm')]
                , [
                    {
                        txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c",
                        output: 1,
                        amount: "0.04863565",
                        scriptpubkey: "76a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac",
                        witnessScript: "",
                        redeemScript: "",
                    },
                ]
            );
            assert.equal(bcrypto.to_hex(signed_tx), '01000000011c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc7010000008a473044022065d3eafbe8d5fdaf7fed931c6d8326ff6ca51316fcf6cfff8ae90c945eb20ad9022016e0e78350d5839e6a7c5eb7137aa38ae2a2b2b6f9aa67af537d3abf2f9dd64401410447326d718ca43de89c961d0622705930f7f0a934343fc1ec27d9da7c26333d4b5290c9aaf135fdb7afde1b703125cb567933cc19299acbbc90ac7dd08ad93c42ffffffff02204e0000000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac46e74900000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000');
        })
    });

})

describe('RCOIN', function () {

    describe('hd', function () {
        describe('create hd from mnemonic', function () {
            let mnemonic = 'army van defense carry jealous true garbage claim echo media make crunch';
            let passphrase = '123456';
            let seed = bcrypto.mnemonic_toseed(mnemonic, passphrase);
            let rootPrivateKey = bcrypto.rcoin_Key.from_seed(seed);
            let first_derive = rootPrivateKey.derive(0x80000000 + 44).derive(0x85f566ff).derive(0x80000001).derive(0).derive(0);
            let address = bcrypto.rcoin_PublicKey.to_address(first_derive.get_pubkey(), bcrypto.LEGACY, bcrypto.rcoin.get_chainparams('regtest'));
            assert.equal(address, 'moAf9t65Fe87ajPJUEjAQb3mFEG6wRzV4k');
        });
    });

    describe('rawkey', function () {
        describe('create raw key', function () {
            const rawkeybytes = bcrypto.from_hex('fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');

            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes, true);

            assert.equal(key.is_valid(), true);

            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '1QKTtag1zQgwhRAKijEy3jFMGPGQr1pMA2');

            assert.equal(bcrypto.to_hex(key.get_raw()), 'fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
        })

        describe('get key raw content', function () {
            const rawkeybytes = bcrypto.from_hex('fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes, true);

            assert.equal(key.is_valid(), true);

            assert.equal(bcrypto.to_hex(key.get_raw()), 'fddbba402e134c7bf17e34aa93ce5203ef53d1d2aac9b9140a1bd00de1229bdf');
        })

        describe('decode wif', function () {
            const key = bcrypto.rcoin.decode_key('2HNkWgyv7qbW8nMWNF4rb7841SKhUP4o2qhMhXeyEg5eDQ1APz8qvGVbTxzUPDBuG2Yv5ab3SMf1xpasRVVuQXAXyqyJSaB')

            assert.equal(key.is_valid(), true);

            const address = bcrypto.rcoin_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.rcoin.get_chainparams('main'));
            assert.equal(address, 'RXhei8mMsxv7GLqQGWbCo2on7wkshxFBXG');
        })
        describe('decode wif 2', function () {
            const key = bcrypto.btc.decode_key('5KetyspvqqbGzxm9dw8bGLfw39cWFUpQJHm5kX1mMsh3AAwnnBm')
            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '13GBgBBnHitW27SyW1MQbfL9t5Dex8dABP');
        })
    });

    describe('btc_base58', function () {
        describe('base decode', function () {
            const rawkeybytes = bcrypto.btc.base58_decode_checked('L3FxrmV1qtA6FAFrqqMfMAX4D4z5JKq5TVmTmrdcZuagT3uMy8JP');

            const key = bcrypto.btc_Key.from_rawbytes(rawkeybytes.slice(1, 33), true);
            const address = bcrypto.btc_PublicKey.to_address(key.get_pubkey(), bcrypto.LEGACY, bcrypto.btc.get_chainparams('main'));

            assert.equal(address, '1BC8TKNDPBW42SSrGD6mpFuWmHPEwhrbbD');
        })

        describe('base encode', function () {
            const rawkeybytes = bcrypto.from_hex('80b42ef4028c1119fa408e714bfdf8692e1232ed6c4d93813adf2259a79b9d343601');
            const wif = bcrypto.btc.base58_encode_checked(rawkeybytes);
            assert.equal(wif, 'L3FxrmV1qtA6FAFrqqMfMAX4D4z5JKq5TVmTmrdcZuagT3uMy8JP');
        })
    });

    describe('chainparams', function () {
        describe('get chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const PUBKEY_ADDRESS_PREFIX = main_net_params.get_base58_prefix(bcrypto.PUBKEY_ADDRESS);
            assert.equal(bcrypto.to_hex(PUBKEY_ADDRESS_PREFIX), '00');
            assert.equal(main_net_params.get_bech32_hrp(), 'bc');
        })

        describe('decode address by chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const hash160 = bcrypto.btc.decode_address('1BC8TKNDPBW42SSrGD6mpFuWmHPEwhrbbD', main_net_params);
            assert.equal(hash160, '6fcc0e341821b180879ecd3e5f1f6d527c52d86b');
        })

        describe('decode witness address by chainparams', function () {
            const main_net_params = bcrypto.btc.get_chainparams('main');
            const hash160 = bcrypto.btc.decode_address('bc1qdlxqudqcyxccppu7e5l978md2f799krtgr997f', main_net_params);
            assert.equal(hash160, '006fcc0e341821b180879ecd3e5f1f6d527c52d86b');
        })
    });



    describe('rawtransaction', function () {
        describe('createrawtransaction', function () {
            const rawtx = bcrypto.btc.create_rawtransaction(
                [
                    { txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c", vout: 0 },
                    { txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c", vout: 1 }
                ],
                [
                    { address: "mhn8yEGm6kKkoDvbDaKnRaYUk4pMnzYeXw", amount: "0.1" },
                    { address: "mhn8yEGm6kKkoDvbDaKnRaYUk4pMnzYeXw", amount: "0.04863182" },
                ]);
            assert.equal(bcrypto.to_hex(rawtx), '02000000021c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70000000000ffffffff1c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70100000000ffffffff0280969800000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288acce344a00000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000');
        })

        describe('get_key_for_rawtransaction', function () {

            const key_id_list = bcrypto.btc.get_required_keyid_to_sign_tranaction_input(
                {
                    scriptpubkey: "76a91491b24bf9f5288532960ac687abb035127b1d28a588ac",
                    witnessScript: "",
                    redeemScript: "",
                }
            );
            assert.equal(1, same_array(key_id_list, ['a5281d7b1235b0ab87c60a96328528f5f94bb291']));
        })

        describe('sign_transaction', function () {

            const signed_tx = bcrypto.btc.sign_rawtransaction(
                bcrypto.from_hex('01000000011c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc70100000000ffffffff02204e0000000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac46e74900000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000')
                , [bcrypto.btc.decode_key('5KetyspvqqbGzxm9dw8bGLfw39cWFUpQJHm5kX1mMsh3AAwnnBm')]
                , [
                    {
                        txid: "c71c067eff3dd8ddcf9dade89e19c3250c6da0aa551a90e7c183665eff69101c",
                        output: 1,
                        amount: "0.04863565",
                        scriptpubkey: "76a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac",
                        witnessScript: "",
                        redeemScript: "",
                    },
                ]
            );
            assert.equal(bcrypto.to_hex(signed_tx), '01000000011c1069ff5e6683c1e7901a55aaa06d0c25c3199ee8ad9dcfddd83dff7e061cc7010000008a473044022065d3eafbe8d5fdaf7fed931c6d8326ff6ca51316fcf6cfff8ae90c945eb20ad9022016e0e78350d5839e6a7c5eb7137aa38ae2a2b2b6f9aa67af537d3abf2f9dd64401410447326d718ca43de89c961d0622705930f7f0a934343fc1ec27d9da7c26333d4b5290c9aaf135fdb7afde1b703125cb567933cc19299acbbc90ac7dd08ad93c42ffffffff02204e0000000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac46e74900000000001976a91418cf6703f8b0688bc7ad7f6d131c6aed4d8c57f288ac00000000');
        })
    });

})

function same_array<T>(a: Array<T>, b: Array<T>): boolean {
    try {
        a.forEach((i) => {
            if (b.find((a) => a == i) == undefined) {
                throw 0;
            }
        });
        return true;
    } catch (e) {
        return false;
    }
    return true;
}