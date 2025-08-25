#include "circom.hpp"
#include "calcwit.hpp"
#define NSignals 12
#define NComponents 3
#define NOutputs 1
#define NInputs 3
#define NVars 6
#define NPublic 2
#define __P__ "21888242871839275222246405745257275088548364400416034343698204186575808495617"

/*
PasswordVerification
*/
void PasswordVerification_0606a12c5399b043(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _sigValue_1[1];
    FrElement _tmp[1];
    FrElement _sigValue_2[1];
    FrElement _sigValue_3[1];
    FrElement _sigValue_4[1];
    int _password_sigIdx_;
    int _salt_sigIdx_;
    int _sum_sigIdx_;
    int _compIdx;
    int _in_sigIdx_;
    int _offset;
    int _compIdx_1;
    int _in_sigIdx__1;
    int _offset_1;
    int _expectedHash_sigIdx_;
    int _compIdx_2;
    int _out_sigIdx_;
    int _out_sigIdx__1;
    Circom_Sizes _sigSizes_in;
    Circom_Sizes _sigSizes_in_1;
    _password_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x4b1a493507b3a318LL /* password */);
    _salt_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x097f5318bf97c581LL /* salt */);
    _sum_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x82719e195d0fc4a8LL /* sum */);
    _expectedHash_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x0e64d4057af29625LL /* expectedHash */);
    _out_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal private input password */
    /* signal private input salt */
    /* signal input expectedHash */
    /* signal sum */
    /* sum <== password + salt */
    ctx->multiGetSignal(__cIdx, __cIdx, _password_sigIdx_, _sigValue, 1);
    ctx->multiGetSignal(__cIdx, __cIdx, _salt_sigIdx_, _sigValue_1, 1);
    Fr_add(_tmp, _sigValue, _sigValue_1);
    ctx->setSignal(__cIdx, __cIdx, _sum_sigIdx_, _tmp);
    /* component eq = IsEqual() */
    /* eq.in[0] <== sum */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0x088e3b07b5394bc3LL /* eq */);
    _in_sigIdx_ = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in = ctx->getSignalSizes(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _offset = _in_sigIdx_;
    ctx->multiGetSignal(__cIdx, __cIdx, _sum_sigIdx_, _sigValue_2, 1);
    ctx->setSignal(__cIdx, _compIdx, _offset, _sigValue_2);
    /* eq.in[1] <== expectedHash */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0x088e3b07b5394bc3LL /* eq */);
    _in_sigIdx__1 = ctx->getSignalOffset(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _sigSizes_in_1 = ctx->getSignalSizes(_compIdx_1, 0x08b73807b55c4bbeLL /* in */);
    _offset_1 = _in_sigIdx__1 + 1*_sigSizes_in_1[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _expectedHash_sigIdx_, _sigValue_3, 1);
    ctx->setSignal(__cIdx, _compIdx_1, _offset_1, _sigValue_3);
    /* signal output out */
    /* out <== eq.out */
    _compIdx_2 = ctx->getSubComponentOffset(__cIdx, 0x088e3b07b5394bc3LL /* eq */);
    _out_sigIdx_ = ctx->getSignalOffset(_compIdx_2, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_2, _out_sigIdx_, _sigValue_4, 1);
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx__1, _sigValue_4);
    ctx->finished(__cIdx);
}
/*
IsEqual
*/
void IsEqual_a4ccc896f031163f(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _sigValue_1[1];
    FrElement _tmp[1];
    FrElement _sigValue_2[1];
    int _compIdx;
    int _in_sigIdx_;
    int _in_sigIdx__1;
    int _offset;
    int _offset_1;
    int _compIdx_1;
    int _out_sigIdx_;
    int _out_sigIdx__1;
    Circom_Sizes _sigSizes_in;
    _in_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _out_sigIdx__1 = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    _sigSizes_in = ctx->getSignalSizes(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    /* signal input in[2] */
    /* signal output out */
    /* component isz = IsZero() */
    /* isz.in <== in[1] - in[0] */
    _compIdx = ctx->getSubComponentOffset(__cIdx, 0x2bcbfb192bf9fc5dLL /* isz */);
    _in_sigIdx_ = ctx->getSignalOffset(_compIdx, 0x08b73807b55c4bbeLL /* in */);
    _offset = _in_sigIdx__1 + 1*_sigSizes_in[1];
    ctx->multiGetSignal(__cIdx, __cIdx, _offset, _sigValue, 1);
    _offset_1 = _in_sigIdx__1;
    ctx->multiGetSignal(__cIdx, __cIdx, _offset_1, _sigValue_1, 1);
    Fr_sub(_tmp, _sigValue, _sigValue_1);
    ctx->setSignal(__cIdx, _compIdx, _in_sigIdx_, _tmp);
    /* out <== isz.out */
    _compIdx_1 = ctx->getSubComponentOffset(__cIdx, 0x2bcbfb192bf9fc5dLL /* isz */);
    _out_sigIdx_ = ctx->getSignalOffset(_compIdx_1, 0x19f79b1921bbcfffLL /* out */);
    ctx->multiGetSignal(__cIdx, _compIdx_1, _out_sigIdx_, _sigValue_2, 1);
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx__1, _sigValue_2);
    ctx->finished(__cIdx);
}
/*
IsZero
*/
void IsZero_0a2b8515b81b5ef3(Circom_CalcWit *ctx, int __cIdx) {
    FrElement _sigValue[1];
    FrElement _tmp[1];
    FrElement _sigValue_1[1];
    FrElement _tmp_1[1];
    FrElement _sigValue_2[1];
    FrElement _tmp_2[1];
    FrElement _sigValue_3[1];
    FrElement _tmp_3[1];
    FrElement _tmp_4[1];
    FrElement _sigValue_4[1];
    FrElement _sigValue_5[1];
    FrElement _tmp_5[1];
    int _in_sigIdx_;
    int _inv_sigIdx_;
    int _out_sigIdx_;
    PFrElement _ter;
    _in_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x08b73807b55c4bbeLL /* in */);
    _inv_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x2b9ffd192bd4c4d8LL /* inv */);
    _out_sigIdx_ = ctx->getSignalOffset(__cIdx, 0x19f79b1921bbcfffLL /* out */);
    /* signal input in */
    /* signal output out */
    /* signal inv */
    /* inv <-- in != 0 ? 1/in : 0 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue, 1);
    Fr_neq(_tmp, _sigValue, (ctx->circuit->constants + 0));
    if (Fr_isTrue(_tmp)) {
        ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_1, 1);
        Fr_div(_tmp_1, (ctx->circuit->constants + 1), _sigValue_1);
        _ter = _tmp_1;
    } else {
        _ter = (ctx->circuit->constants + 0);
    }
    ctx->setSignal(__cIdx, __cIdx, _inv_sigIdx_, _ter);
    /* out <== -in*inv + 1 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_2, 1);
    Fr_neg(_tmp_2, _sigValue_2);
    ctx->multiGetSignal(__cIdx, __cIdx, _inv_sigIdx_, _sigValue_3, 1);
    Fr_mul(_tmp_3, _tmp_2, _sigValue_3);
    Fr_add(_tmp_4, _tmp_3, (ctx->circuit->constants + 1));
    ctx->setSignal(__cIdx, __cIdx, _out_sigIdx_, _tmp_4);
    /* in*out === 0 */
    ctx->multiGetSignal(__cIdx, __cIdx, _in_sigIdx_, _sigValue_4, 1);
    ctx->multiGetSignal(__cIdx, __cIdx, _out_sigIdx_, _sigValue_5, 1);
    Fr_mul(_tmp_5, _sigValue_4, _sigValue_5);
    ctx->checkConstraint(__cIdx, _tmp_5, (ctx->circuit->constants + 0), "C:\Users\USER\Desktop\zk-auth\server\src\circuits\password.circom:35:4");
    ctx->finished(__cIdx);
}
// Function Table
Circom_ComponentFunction _functionTable[3] = {
     PasswordVerification_0606a12c5399b043
    ,IsEqual_a4ccc896f031163f
    ,IsZero_0a2b8515b81b5ef3
};
