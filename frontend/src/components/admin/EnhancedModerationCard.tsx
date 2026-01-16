import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Calendar,
  MessageSquare,
  Heart,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: { avatar?: string };
  };
  status: string;
  category: string;
  createdAt: string;
  views?: number;
  likesCount?: number;
  commentsCount?: number;
  moderationNotes?: string;
  featuredImage?: string;
}

interface EnhancedModerationCardProps {
  post: Post;
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  onView: (postId: string) => void;
  onDelete?: (postId: string) => void;
  index: number;
}

const statusConfig = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Clock,
    label: 'Pending Review',
  },
  published: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    label: 'Published',
  },
  rejected: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    label: 'Rejected',
  },
  draft: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    icon: MessageSquare,
    label: 'Draft',
  },
};

const EnhancedModerationCard: React.FC<EnhancedModerationCardProps> = ({
  post,
  onApprove,
  onReject,
  onView,
  onDelete,
  index,
}) => {
  const config = statusConfig[post.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Featured Image */}
            {post.featuredImage && (
              <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author.firstName} {post.author.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge className={`${config.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>

              {/* Excerpt */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Category & Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <Badge variant="outline">{post.category}</Badge>
                <span className="flex items-center gap-1 text-gray-500">
                  <Eye className="h-4 w-4" />
                  {post.views || 0}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <Heart className="h-4 w-4" />
                  {post.likesCount || 0}
                </span>
                <span className="flex items-center gap-1 text-gray-500">
                  <MessageSquare className="h-4 w-4" />
                  {post.commentsCount || 0}
                </span>
              </div>

              {/* Moderation Notes */}
              {post.moderationNotes && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-900 dark:text-red-200">
                        Moderation Notes
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {post.moderationNotes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(post._id)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>

                {post.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onApprove(post._id)}
                      className="gap-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject(post._id)}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}

                {post.status === 'rejected' && (
                  <Button
                    size="sm"
                    onClick={() => onApprove(post._id)}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                )}

                {onDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(post._id)}
                    className="ml-auto"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedModerationCard;
