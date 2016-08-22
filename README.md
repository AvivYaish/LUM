# LUM

![Demonstration video](/relative/path/to/img.jpg?raw=true "Demonstration video")

Choose a matrix size, then input it's data. Choose a decomposition type and press "Decompose" to
perform it.

LU decomposes the given matrix M into a pair L,U such that M = LU, when L is lower triangular and U
is upper triangular.

PLU allows using a P row pivot matrix to move rows in M to ensure it has an LU decomposition.

LDLt decomposes the given matrix based on the algorithm in p. 139 of Matrix Computations by
Golub-Van Loan such that the result contains the L matrix below the diagonal, and the D matrix
on the diagonal itself.

Special thanks to:

jQuery

math.js - awesome library, very useful matrix functions

TodoMVC - used some CSS

Jo Sardinha - used some of his table CSS