import { Entity, Enum, Opt, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole, UserStatus } from '../../../common/enums/user.enum';

@Entity({ tableName: 'users' })
export class User extends BaseEntity {
  @Property({ fieldName: 'clerk_id' })
  @Unique()
  clerkId!: string;

  @Property()
  @Unique()
  email!: string;

  @Enum({ items: () => UserRole })
  role: UserRole & Opt = UserRole.USER;

  @Property({ fieldName: 'first_name' })
  firstName!: string;

  @Property({ fieldName: 'last_name' })
  lastName!: string;

  @Property({ fieldName: 'phone_number', nullable: true })
  phoneNumber: string | null = null;

  @Property({ fieldName: 'avatar_url', nullable: true })
  avatarUrl: string | null = null;

  @Enum({ items: () => UserStatus })
  status: UserStatus & Opt = UserStatus.ACTIVE;
}
