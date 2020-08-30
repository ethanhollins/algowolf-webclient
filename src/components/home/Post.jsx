import React, { Component } from 'react';
import ProfileIcon from './ProfileIcon.jsx';

class Post extends Component
{
    state = {
        title: null,
        username: null,
        tags: null,
        date: null,
        message: null,
        media: null
    }

    render()
    {
        return (
            <React.Fragment>

            <article className='post'>
                <ProfileIcon />
                <div>
                    <div className='post title'>
                        Get started with Scott Phillips Scalping Strategy
                    </div>
                    <div className='post user'>
                        <a id='username' href='/u/scottphillips'>@scottphillips</a>
                    </div>
                    <div className='post info'>
                        <span className='post tag'>Strategy</span>
                        <span className='post tag'>Scalp</span>
                        <span className='post tag'>Short Term</span>
                        <span className='post date'>Aug 29</span>
                    </div>
                    <div className='post body'>
                        <div className='post paragraph'>
                            No more endless market watching, waiting for the right points of entry only to miss
                            them because you miscalculated a rule. Our Scott Phillips Scalping strategy algorithm
                            does all the work for you! Click to get started.
                        </div>
                        <div className='post graph'></div>
                    </div>
                </div>
            </article>
            <div className='post separator'></div>

            </React.Fragment>
        );
    }
}

export default Post;