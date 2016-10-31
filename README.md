# LUM

![Demonstration video](/demo.gif?raw=true "Demonstration video")

Choose a matrix size, then input it's data, or drag and drop a file containing the matrix data in the GNU Octave format.
Choose an action and press "Decompose" to perform the requested action.

# Decomposition types
These actions are performed step by step according to various text-book algorithms.

LU decomposes the given matrix M into a pair L,U such that M = LU, when L is lower triangular and U
is upper triangular.

PLU allows using a P row pivot matrix to move rows in M to ensure it has an LU decomposition.

LDLt decomposes the given matrix based on the algorithm in p. 139 of Matrix Computations by
Golub-Van Loan such that the result contains the L matrix below the diagonal, and the D matrix
on the diagonal itself.
Also supported is LDLt for sparse matrices, although when used through the GUI the matrix has
to be supplied in a dense format.

# Other actions
RREF and Nullspace modes simply show the requested output, without the steps.

# Thanks
Special thanks to:

jQuery

math.js - awesome library, very useful matrix functions

TodoMVC - used some CSS

Jo Sardinha - used some of his table CSS