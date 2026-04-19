import { DEFAULT_AVATAR } from '@/constants/images'
import {
  Avatar as ShadCNAvatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

interface AvatarProps {
  name: string
  src: string
  size: 'default' | 'sm' | 'lg'
  isActive?: boolean
  alt?: string
}

export const Avatar = ({
  src = '',
  name = '',
  size = 'default',
  alt = '',
  isActive = false,
}: AvatarProps) => {
  return (
    <ShadCNAvatar size={size}>
      <AvatarImage src={src || (name ? '' : DEFAULT_AVATAR)} alt={alt} />
      <AvatarFallback>{name}</AvatarFallback>
      {isActive && (
        <div className="absolute top-1 right-0 z-2 w-2.75 h-2.75 bg-white flex flex-col items-center justify-center rounded-full">
          <div className="w-2.25 h-2.25 bg-error rounded-full" />
        </div>
      )}
    </ShadCNAvatar>
  )
}
