def dec_to_binarr(dec, l=None):
    bin_s = bin(dec)[2:]
    while l and len(bin_s)<l: bin_s="0"+bin_s
    return [ c=="1" for c in bin_s ]