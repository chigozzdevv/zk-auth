template PasswordVerification() {
    signal private input password;
    signal private input salt;
    signal input expectedHash;
    
    // Simple verification: check if password + salt == expectedHash
    signal sum;
    sum <== password + salt;
    
    component eq = IsEqual();
    eq.in[0] <== sum;
    eq.in[1] <== expectedHash;
    
    // Public output - 1 if valid, 0 if invalid
    signal output out;
    out <== eq.out;
}

template IsEqual() {
    signal input in[2];
    signal output out;
    
    component isz = IsZero();
    isz.in <== in[1] - in[0];
    out <== isz.out;
}

template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    inv <-- in != 0 ? 1/in : 0;
    out <== -in*inv + 1;
    in*out === 0;
}

component main = PasswordVerification();