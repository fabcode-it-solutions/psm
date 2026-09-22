'use server';

import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth/auth';

export async function followUserAction(userId: number, currentUserId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || session?.user?.id !== currentUserId) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/user/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        followingId: userId,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to follow user');
    }

    // Selective cache invalidation
    revalidateTag(`user-${userId}`);
    revalidateTag(`user-${currentUserId}`);
    revalidateTag(`follow-${currentUserId}-${userId}`);
    revalidateTag(`follow-${userId}-${currentUserId}`);
    revalidateTag(`followers-${userId}`);
    
    return result;
  } catch (error) {
    console.error('Follow action error:', error);
    throw error;
  }
}

export async function unfollowUserAction(userId: number, currentUserId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.id !== currentUserId) {
    throw new Error('Unauthorized');
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/user/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockerId: currentUserId,
        blockedId: userId,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to unfollow user');
    }

    // Selective cache invalidation
    revalidateTag(`user-${userId}`);
    revalidateTag(`user-${currentUserId}`);
    revalidateTag(`follow-${currentUserId}-${userId}`);
    revalidateTag(`follow-${userId}-${currentUserId}`);
    revalidateTag(`followers-${userId}`);
    
    return result;
  } catch (error) {
    console.error('Unfollow action error:', error);
    throw error;
  }
}

export async function blockUserAction(userId: number, currentUserId: number) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.id !== currentUserId) {
    throw new Error('Unauthorized');
  }
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/user/block`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockerId: currentUserId,
        blockedId: userId,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to block user');
    }

    // Cache invalidation for block status
    revalidateTag(`block-${currentUserId}-${userId}`);
    revalidateTag(`user-${userId}`);
    
    return result;
  } catch (error) {
    console.error('Block action error:', error);
    throw error;
  }
}

export async function updatePrivacyAction(userId: number, isPrivate: boolean) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/user`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        isPrivate,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update privacy');
    }

    // Cache invalidation
    revalidateTag(`user-${userId}`);
    
    return result;
  } catch (error) {
    console.error('Privacy update error:', error);
    throw error;
  }
}
