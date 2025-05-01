import { get } from 'lodash';
import { GetUserResponse, UserAbout } from 'src/gen/user.service';

export const convertToUserAboutProto = (userAbout: any): UserAbout => {
  return {
    workRole: get(userAbout, 'workRole', ''),
    company: get(userAbout, 'company', ''),
    country: get(userAbout, 'country', ''),
    school: get(userAbout, 'school', ''),
    totalFollowers: get(userAbout, 'totalFollowers', 0),
    totalFollowing: get(userAbout, 'totalFollowing', 0),
    quote: get(userAbout, 'quote', ''),
    facebook: get(userAbout, 'facebook', ''),
    twitter: get(userAbout, 'twitter', ''),
    linkedin: get(userAbout, 'linkedin', ''),
    instagram: get(userAbout, 'instagram', ''),
  };
};

export const convertToUserProto = (user: any): GetUserResponse => {
  return {
    id: get(user, 'id', ''),
    name: get(user, 'name', ''),
    avatar: get(user, 'avatar', ''),
    phoneNumber: get(user, 'phoneNumber', ''),
    address: get(user, 'address', ''),
    location: get(user, 'location', ''),
    about: convertToUserAboutProto(get(user, 'about', {})),
    isPublic: get(user, 'isPublic', false),
    email: get(user, 'email', ''),
    gender: get(user, 'gender', ''),
    phoneVerifiedAt: get(user, 'phoneVerifiedAt', null),
    emailVerifiedAt: get(user, 'emailVerifiedAt', null),
    status: get(user, 'status', ''),
    role: get(user, 'role', ''),
  };
};
