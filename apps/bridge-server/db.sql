SQLite format 3   @                                                                   .K�; � C�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         [�tabledocumentsdocumentsCREATE TABLE documents(docId text PRIMARY KEY, content text)1E indexsqlite_autoindex_documents_1documents       �:!!�?tablesyncStatessyncStatesCREATE TABLE syncStates(
            id integer PRIMARY KEY,
            peerId text NOT NULL, 
            docId text NOT NULL, 
            state text)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        �"�Atree133,111,74,131,145,238,133,39,0,171,11,3,16,4,177,34,19,14,110,67,87,149,252,123,82,137,40,146,72,16,199,236,58,233,15,118,77,152,162,222,124,26,192,31,94,109,16,132,154,236,72,191,207,79,141,143,192,27,161,237,89,124,107,1,61,17,246,113,111,77,26,106,27,53,41,249,181,231,61,161,14,210,92,106,193,36,246,227,253,117,109,109,111,105,140,29,8,1,6,3,5,19,7,35,10,53,18,64,4,67,4,86,2,14,1,7,2,144,1,17,62,19,132,1,29,78,33,9,35,148,1,52,39,66,112,86,178,1,95,201,2,128,1,11,129,1,2,1   
   � �                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              	tree        22,127,14,73,110,105,116,105,97,108,105,122,97,116,105,111,110,2,0,127,0,2,1,126,0,1,3,7,0,2,148,1,0,0,2,8,2,2,3,126,4,5,2,8,4,9,2,10,2,11,2,12,7,13,127,14,2,16,2,17,119,18,20,23,25,27,29,31,34,37,2,39,2,40,126,41,43,2,46,2,47,126,48,50,2,54,5,55,123,56,58,60,62,64,2,67,2,68,2,69,125,70,71,74,2,77,3,78,2,79,3,80,2,81,124,82,83,86,88,2,91,6,92,124,93,95,97,99,2,101,3,102,123,103,105,107,110,113,2,116,5,117,2,118,126,119,120,2,123,7,124,116,125,127,129,1,131,1,133,1,135,1,137,1,140,1,142,1,144,1,147,1,149,1,0,3,7,0,0,7,3,0,0,3,127,0,0,3,6,0,0,4,127,0,0,12,127,0,0,5,127,0,0,5,4,0,0,8,127,0,0,8,2,0,0,3,2,0,0,9,5,0,0,7,2,0,0,8,4,0,0,7,6,0,0,12,0,2,120,0,3,5,46,13,10,39,31,0,2,127,237,126,0,3,124,0,10,27,2,0,2,126,89,12,0,2,124,116,14,2,7,3,2,0,3,126,99,18,0,11,126,110,41,0,4,126,87,48,0,4,126,80,56,3,2,0,7,126,66,197,0,0,2,127,187,127,0,4,125,0,207,0,12,0,2,125,165,127,209,0,5,0,2,127,170,127,0,5,126,0,221,0,4,2,0,6,125,155,127,231,0,2,0,7,123,151,127,246,0,5,17,2,0,2,127,242,126,0,3,126,0,253,0,5,2,0,12,171,227,72,206,200,204,73,41,74,205,99,41,72,44,201,96,224,168,67,19,96,172,5,211,104,162,44,232,202,152,208,5,216,177,234,99,226,4,211,24,186,153,72,17,102,101,197,174,26,195,233,216,181,51,19,20,96,100,198,170,145,141,5,187,121,216,157,195,74,92,72,178,243,128,105,0,150,1,0,99,2,127,2,5,46,13,10,39,31,2,239,126,3,126,1,3,44,85,27,2,7,93,25,104,22,107,20,109,2,7,4,2,120,112,2,5,124,2,127,2,3,4,2,2,3,113,2,5,124,2,127,2,3,5,124,2,127,2,4,11,118,4,2,127,121,4,2,120,3,8,121,5,124,3,126,1,2,3,110,37,92,12,22,95,10,119,5,2,122,3,126,1,3,2,3,20,109,4,2,126,9,112,4,2,126,7,122,2,2,127,125,2,2,3,3,124,29,100,5,17,2,2,121,103,3,126,1,3,15,114,6,2,127,117,6,2,127,3,2,2,126,3,2,2,8,2,1,3,4,2,2,2,7,3,2,11,2,4,2,4,5,7,2,2,1,4,3,2,3,2,1,5,6,6,3,7,5,2,1,3,7,12,126,2,1,8,0,122,2,1,0,1,2,1,4,0,126,2,1,2,0,126,2,1,7,0,125,1,2,1,2,0,9,1,126,2,1,2,0,2,1,126,2,1,2,0,2,1,126,2,1,5,0,5,1,126,2,1,2,0,125,2,1,0,2,1,126,2,1,3,0,126,2,1,3,0,125,2,1,0,3,1,126,2,1,6,0,4,1,126,2,1,3,0,5,1,126,2,1,5,0,122,2,1,0,1,2,1,7,0,12,1,126,0,70,9,0,123,118,0,134,1,0,86,5,0,127,198,1,3,0,127,198,4,7,0,125,230,1,0,230,2,2,0,125,134,1,182,1,166,3,2,134,1,126,182,2,230,1,2,134,1,126,0,166,1,2,0,124,102,134,1,0,118,2,0,2,134,1,126,0,86,5,0,2,134,1,123,150,1,134,1,118,0,134,1,3,0,126,134,2,0,2,134,1,126,0,166,1,4,0,127,118,4,0,121,118,0,118,166,1,246,1,0,54,6,0,122,150,2,134,1,150,1,230,1,0,134,1,3,0,121,118,214,1,102,166,1,134,1,0,134,1,6,0,123,166,1,0,134,1,0,102,7,0,125,134,1,150,1,198,1,2,134,1,125,118,134,1,198,1,3,134,1,127,102,109,82,81,106,195,48,12,189,209,216,118,131,66,247,59,74,217,127,80,108,53,81,23,91,198,146,211,102,231,217,77,118,177,201,110,194,74,25,4,20,201,79,239,189,60,71,81,116,151,221,72,51,82,244,120,125,10,126,151,17,196,177,199,206,113,84,188,234,169,68,167,196,177,227,254,140,78,165,147,17,50,250,14,227,76,153,99,192,168,114,200,63,223,66,239,172,40,70,1,134,159,65,41,14,43,168,97,54,129,88,81,221,243,235,127,192,27,155,157,144,55,23,181,174,75,19,170,98,238,148,187,176,8,78,39,27,137,22,79,220,57,51,115,7,220,42,39,165,64,95,70,237,113,190,155,75,130,72,50,110,237,133,179,175,58,205,250,163,104,171,47,77,138,243,98,213,48,106,229,144,185,37,1,69,38,136,94,4,131,29,96,126,244,112,68,17,46,217,161,244,196,19,15,203,144,249,98,142,2,197,74,179,118,246,150,108,189,197,157,121,178,214,28,67,209,209,162,32,7,53,122,155,185,236,91,48,17,121,166,80,61,89,10,35,139,222,24,36,82,74,168,210,131,140,214,158,97,182,75,204,148,170,206,84,96,245,126,195,110,246,62,218,229,35,236,77,248,136,129,255,254,129,125,41,197,227,91,72,90,191,26,164,62,213,195,136,238,115,162,150,1,2,200,114,71,22,128,170,77,133,126,194,7,40,5,24,112,75,239,156,134,109,37,129,200,197,255,2,12,0,127,1,13,0,127,1,251,0,0,2,1,126,152,1,127,2                                                                                                                                                                                                                                                                                                                                                            31,1,4,127,0,2,1,127,2,124,1,0,1,127,127,150,1,2,1,127,2,124,232,162,140,143,6,155,14,22,6,127,14,73,110,105,116,105,97,108,105,122,97,116,105,111,110,3,0,127,0,3,1,127,0,2,1,4,7,0,2,149,1,0,127,2,0,2,8,2,2,3,2,4,127,5,2,8,4,9,2,10,2,11,2,12,7,13,127,14,2,16,2,17,119,18,20,23,25,27,29,31,34,37,2,39,2,40,126,41,43,2,46,2,47,126,48,50,2,54,5,55,123,56,58,60,62,64,2,67,2,68,2,69,125,70,71,74,2,77,3,78,2,79,3,80,2,81,124,82,83,86,88,2,91,6,92,124,93,95,97,99,2,101,3,102,123,103,105,107,110,113,2,116,5,117,2,118,126,119,120,2,123,7,124,115,125,127,129,1,131,1,133,1,135,1,137,1,140,1,142,1,144,1,147,1,149,1,153,1,0,3,7,0,0,8,3,0,0,3,127,0,0,3,6,0,0,4,127,0,0,12,127,0,0,5,127,0,0,5,4,0,0,8,127,0,0,8,2,0,0,3,2,0,0,9,5,0,0,7,2,0,0,8,4,0,0,7,6,0,0,13,0,2,120,0,3,5,46,13,10,39,31,0,2,126,237,126,0,0,3,124,0,10,27,2,0,2,126,89,12,0,2,124,116,14,2,7,3,2,0,3,126,99,18,0,11,126,110,41,0,4,126,87,48,0,4,126,80,56,3,2,0,7,126,66,197,0,0,2,127,187,127,0,4,125,0,207,0,12,0,2,125,165,127,209,0,5,0,2,127,170,127,0,5,126,0,221,0,4,2,0,6,125,155,127,231,0,2,0,7,123,151,127,246,0,5,17,2,0,2,127,242,126,0,3,126,0,253,0,5,2,0,13,171,227,72,206,200,204,73,41,74,205,99,41,72,44,201,96,224,168,67,19,96,170,5,211,104,162,44,24,202,208,5,216,177,234,99,226,4,211,24,186,153,72,17,102,101,197,174,26,93,128,17,187,118,102,130,2,140,204,88,53,178,177,96,55,15,187,115,88,49,76,197,26,34,236,188,96,26,0,12,0,127,2,138,1,0,127,2,98,2,127,2,5,46,13,10,39,31,2,239,126,3,146,1,236,126,1,3,44,85,27,2,7,93,25,104,22,107,20,109,2,7,4,2,120,112,2,5,124,2,127,2,3,4,2,2,3,113,2,5,124,2,127,2,3,5,124,2,127,2,4,11,118,4,2,127,121,4,2,120,3,8,121,5,124,3,126,1,2,3,110,37,92,12,22,95,10,119,5,2,122,3,126,1,3,2,3,20,109,4,2,126,9,112,4,2,126,7,122,2,2,127,125,2,2,3,3,124,29,100,5,17,2,2,121,103,3,126,1,3,15,114,6,2,127,117,6,2,127,3,2,2,125,3,2,4,2,8,2,2,3,4,2,2,2,7,3,2,11,2,4,2,4,5,7,2,2,1,4,3,2,3,2,1,5,6,6,3,7,5,2,1,3,7,13,126,2,1,8,0,126,2,1,2,0,125,1,2,1,4,0,126,2,1,2,0,126,2,1,7,0,125,1,2,1,2,0,9,1,126,2,1,2,0,2,1,126,2,1,2,0,2,1,126,2,1,5,0,5,1,126,2,1,2,0,125,2,1,0,2,1,126,2,1,3,0,126,2,1,3,0,125,2,1,0,3,1,126,2,1,6,0,4,1,126,2,1,3,0,5,1,126,2,1,5,0,122,2,1,0,1,2,1,7,0,13,1,126,0,70,9,0,127,118,2,0,125,134,1,0,86,5,0,127,198,1,3,0,127,198,4,7,0,125,230,1,0,230,2,2,0,125,134,1,182,1,166,3,2,134,1,126,182,2,230,1,2,134,1,126,0,166,1,2,0,124,102,134,1,0,118,2,0,2,134,1,126,0,86,5,0,2,134,1,123,150,1,134,1,118,0,134,1,3,0,126,134,2,0,2,134,1,126,0,166,1,4,0,127,118,4,0,121,118,0,118,166,1,246,1,0,54,6,0,122,150,2,134,1,150,1,230,1,0,134,1,3,0,121,118,214,1,102,166,1,134,1,0,134,1,6,0,123,166,1,0,134,1,0,102,7,0,125,134,1,150,1,198,1,2,134,1,125,118,134,1,198,1,3,134,1,126,102,134,1,109,82,81,78,195,48,12,189,17,2,110,48,9,126,209,52,241,95,185,137,215,122,52,113,20,59,221,202,121,184,9,23,195,201,90,152,38,164,74,174,157,231,247,94,95,170,40,186,203,110,164,25,41,122,188,60,4,191,203,8,226,216,99,231,56,42,94,244,88,162,83,226,216,113,127,66,167,210,201,8,25,125,135,113,166,204,49,96,84,217,231,239,47,161,55,86,20,163,0,195,207,160,20,135,21,212,48,155,64,172,168,238,241,249,63,224,149,205,78,200,155,139,90,215,165,9,85,49,119,202,93,88,4,167,163,141,68,139,39,238,156,153,185,1,110,149,147,82,160,79,163,246,56,223,204,37,65,36,25,183,246,204,217,87,157,102,253,94,180,213,167,38,197,121,177,106,24,181,178,207,220,146,128,34,19,68,47,130,193,14,48,223,123,56,160,8,151,236,80,122,226,137,135,101,200,124,54,71,129,98,165,89,59,123,75,182,222,226,206,60,89,107,142,161,232,104,81,144,131,26,189,205,92,246,45,152,136,60,83,168,158,44,133,145,69,175,12,18,41,37,84,233,65,70,107,79,48,219,37,102,74,85,103,42,176,122,191,98,55,123,239,237,242,17,94,76,248,128,129,255,254,129,151,82,138,199,215,144,180,126,53,72,125,170,135,17,221,199,68,45,3,4,144,229,134,44,0,85,155,10,253,132,119,80,10,48,224,150,222,41,13,219,74,2,145,243,47,193,15,13,0,127,1,13,0,127,1,252,0,0,2,1,126,152,1,127,3                                                                                                                                                                                                   