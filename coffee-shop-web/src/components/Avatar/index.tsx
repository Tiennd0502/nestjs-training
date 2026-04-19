import { DEFAULT_AVATAR } from '@/constants/images'
import {
  Avatar as ShadCNAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

interface AvatarProps {
  name: string
  src: string
  size?: 'default' | 'sm' | 'lg'
  isActive?: boolean
  alt?: string
  isProfile?: boolean
}

export const Avatar = ({
  src = '',
  name = '',
  size = 'default',
  alt = '',
  isActive = false,
  isProfile = false,
}: AvatarProps) => {
  return (
    <ShadCNAvatar
      size={isProfile ? undefined : size}
      className={
        isProfile
          ? 'size-48 rounded-xl shadow-[0_10px_40px_rgba(136,82,0,0.1)] after:rounded-xl'
          : ''
      }
    >
      <AvatarImage
        src={isProfile ? src : src || (name ? '' : DEFAULT_AVATAR)}
        alt={alt}
        className={isProfile ? 'rounded-xl' : ''}
      />
      <AvatarFallback
        className={
          isProfile ? 'rounded-xl font-semibold text-on-surface-variant' : ''
        }
      >
        {name}
      </AvatarFallback>

      {!isProfile && isActive && (
        <div className="absolute top-1 right-0 z-2 w-2.75 h-2.75 bg-white flex flex-col items-center justify-center rounded-full">
          <div className="w-2.25 h-2.25 bg-error rounded-full" />
        </div>
      )}
    </ShadCNAvatar>
  )
}
