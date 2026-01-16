import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment must be at least 1 character'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment',
});

// Method to add like
commentSchema.methods.addLike = async function (userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    await this.save();
  }
  return this;
};

// Method to remove like
commentSchema.methods.removeLike = async function (userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  this.likesCount = this.likes.length;
  await this.save();
  return this;
};

// Static method to get comments with replies
commentSchema.statics.getCommentsWithReplies = async function (postId) {
  const comments = await this.find({ post: postId, parentComment: null })
    .populate('author', 'firstName lastName email profile')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'firstName lastName email profile',
      },
    })
    .sort({ createdAt: -1 })
    .lean();

  return comments;
};

// Middleware to update post comment count
commentSchema.post('save', async function () {
  const BlogPost = mongoose.model('BlogPost');
  const count = await this.constructor.countDocuments({ post: this.post, parentComment: null });
  await BlogPost.findByIdAndUpdate(this.post, { commentsCount: count });
});

commentSchema.post('remove', async function () {
  const BlogPost = mongoose.model('BlogPost');
  const count = await this.constructor.countDocuments({ post: this.post, parentComment: null });
  await BlogPost.findByIdAndUpdate(this.post, { commentsCount: count });
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
