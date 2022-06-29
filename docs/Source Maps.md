So all nodes have a `loc`
and all locs have an `idx`
and we're going to ensure that `idx` is unique per node.

Are there problems with making those idx's not persist between ... somethings?
hmmm I guess maybe what I want to do, is re-use loc's but zero out the idx?
And then do a pass ... um ... uniquifying them?
I mean at that point, if I'm going to the trouble, why not just
fix it anyway.
