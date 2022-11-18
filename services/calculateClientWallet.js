function clientWalletToZeton(makseideriai, piniginiai, zetonai) {
    let all = 0;
    all = zetonai;
    all += (piniginiai * 100);
    all += (makseideriai * 10000);
    return all;
}

module.exports = { clientWalletToZeton }