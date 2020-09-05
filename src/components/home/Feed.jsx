import React, { Component } from 'react';
import Post from './Post';

class Feed extends Component
{
    render()
    {
        return (
            <div className='feed'>
                <Post />
                <Post />
                <Post />
                <Post />
            </div>
        );
    }
}

export default Feed;