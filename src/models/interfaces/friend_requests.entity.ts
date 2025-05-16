import { BaseEntity } from 'src/libs/base/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { FriendRequestType } from 'src/enums/friend-request-type.enum';

@Entity({ name: 'friend_requests' })
@Index('friend_request_index', ['sender', 'receiver'], { unique: true })
export class FriendRequest extends BaseEntity {
  @ManyToOne(() => User, (user) => user.friendRequest)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.friendRequest)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ nullable: false })
  status: FriendRequestType;
}
